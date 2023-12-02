export function isEmpAuthorizedFor (permissions : any[] , PermissionName : string , type : 'admin' | 'employee') {
    if(type == 'admin'){
      return true
    }
    else{
      let filteredPermission =  permissions.filter((permission : any) => permission.role_name == PermissionName)
      return filteredPermission.length > 0
    }
  }