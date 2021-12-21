import * as kleur from 'kleur';
import retry from 'async-retry';
import { loadUserConfig, lambdaViewKey } from './config-util';
import { createToolkit } from './contracts';
import Configstore from 'configstore';
import { startSandbox, killSandbox } from '@oxheadalpha/nft-contracts';
import { TezosToolkit, VIEW_LAMBDA } from '@taquito/taquito';

export async function bootstrap(): Promise<void> {
  try {
    const config = loadUserConfig();

    const network = config.get('activeNetwork');
    if (network === 'sandbox') {
      await startSandbox();
      console.log(kleur.yellow('starting sandbox...'));
      await awaitForNetwork();
      console.log(kleur.green('sandbox started'));

      await originateLambdaViewContract(config, 'bob');
    }
  } catch (err) {
    console.log(kleur.red('failed to start. ' + JSON.stringify(err)));
    return Promise.reject(err);
  }
}

export async function kill(): Promise<void> {
  const config = loadUserConfig();
  const network = config.get('activeNetwork');
  if (network === 'sandbox') await killSandbox();
}

async function awaitForNetwork(): Promise<void> {
  const config = loadUserConfig();
  const toolkit = await createToolkit('bob', config);
  await retry(
    async () => {
      console.log('connecting to Tezos node rpc...');
      await toolkit.rpc.getBlockHeader({ block: '2' });
    },
    { retries: 8 }
  );
}

async function originateLambdaViewContract(
  config: Configstore,
  orig_alias: string
): Promise<void> {
  const tezos = await createToolkit(orig_alias, config);
  const configKey = lambdaViewKey(config);
  const a = await contractAddressIfExists(config, tezos, configKey);
  if (a) return;

  console.log(
    kleur.yellow(`originating balance Taquito lambda view contract contract...`)
  );
  const op = await tezos.contract.originate({
    code: VIEW_LAMBDA.code,
    storage: VIEW_LAMBDA.storage
  });
  const lambdaContract = await op.contract();

  config.set(configKey, lambdaContract.address);
  console.log(
    kleur.yellow(
      `originated Taquito lambda view ${kleur.green(lambdaContract.address)}`
    )
  );
}

async function contractAddressIfExists(
  config: Configstore,
  tz: TezosToolkit,
  configKey: string
): Promise<string | undefined> {
  const existingAddress = config.get(configKey);
  if (!existingAddress) return undefined;

  return tz.contract
    .at(existingAddress)
    .then(c => c.address)
    .catch(() => undefined);
}