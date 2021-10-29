import Base64 from 'base-64';

export class UserInfo {

  setUserInfo = token => {
    let data = {
      time: new Date().getTime(),
      token: token
    };
    window.localStorage.setItem('userEncrypted', Base64.encode(JSON.stringify(data)));
  };

  getUserInfo = () => {
    const userData = window.localStorage.getItem('userEncrypted');
    // Check the existence of user info
    if (!userData) return null;
    // Get the content of encrypted user info
    let obj = JSON.parse(Base64.decode(userData));
    // Delete user info if it expires
    if (new Date().getTime() - obj.time > 1800000 || new Date().getTime() < obj.time) {
      window.localStorage.removeItem('userEncrypted');
      return -1;
    }
    // Update latest time if the session does not expire
    obj.time = new Date().getTime();
    window.localStorage.setItem('userEncrypted', Base64.encode(JSON.stringify(obj)));
    return obj;
  }
}