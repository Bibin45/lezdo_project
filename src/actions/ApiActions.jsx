export const app_path = process.env.REACT_APP_APP_API_ROOT

const headers = new Headers();

export const call_fetch = (path, request) =>{
    return fetch(path, {method: "POST", body:  JSON.stringify(request), headers: headers });
          
  }

export const getRecords = request => {
    return call_fetch(app_path + '/api/records', request);
 }