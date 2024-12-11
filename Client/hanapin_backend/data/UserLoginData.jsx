class UserLoginData {
   constructor() {
      this.listeners = [];
      this.userData = this.loadUserData(); // Load from sessionStorage when initialized
   }

   // Methods for managing user data
   setData(key, data) {
      this.userData[key] = data;
      this.saveUserData(); // Save to sessionStorage whenever the data is updated
      this.notifyListeners();
   }

   getData(key) {
      return this.userData[key];
   }

   // Load user data from sessionStorage
   loadUserData() {
      const data = sessionStorage.getItem('userData');
      return data ? JSON.parse(data) : {};  // Return parsed data or an empty object if not found
   }

   // Save user data to sessionStorage
   saveUserData() {
      sessionStorage.setItem('userData', JSON.stringify(this.userData));
   }

   subscribe(listener) {
      this.listeners.push(listener);
   }

   unsubscribe(listener) {
      this.listeners = this.listeners.filter(l => l !== listener);
   }

   notifyListeners() {
      this.listeners.forEach(listener => listener());
   }
}

const userLoginData = new UserLoginData();
export default userLoginData;