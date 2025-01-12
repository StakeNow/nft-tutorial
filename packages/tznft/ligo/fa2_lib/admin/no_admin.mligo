(**
Definition of the admin module signature and implementation of the "no admin".
No admin - everyone is an admin
 *)

#if !NO_ADMIN
#define NO_ADMIN

type admin_storage = unit
type admin_entrypoints = never

(* Fails if sender is not admin*)
[@inline]
let fail_if_not_admin (_storage : admin_storage) : unit = unit

[@inline]
let fail_if_not_admin_ext (_storage, _extra_msg : admin_storage * string) : unit = unit

(* Returns true if sender is admin *)
[@inline]
let is_admin (_storage : admin_storage) : bool = true

[@inline]
let fail_if_paused (_storage : admin_storage) : unit = unit

let admin_main(_param, storage : admin_entrypoints * admin_storage)
    : (operation list) * admin_storage = ([] : operation list), storage

#endif


