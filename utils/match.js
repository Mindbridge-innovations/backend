const { getDatabase, ref, get, query, orderByChild, equalTo } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

//match users based on some algorithm.
const matchUsers = async (userId) => {
  try {
    const db = getDatabase(firebaseApp);
    const usersRef = ref(db, 'users');
    const usersQuery = query(usersRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(usersQuery);
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const userKey = Object.keys(usersData).find(key => usersData[key].userId === userId);
      const userData = usersData[userKey];
        const userAge = userData.age;
        const userGender = userData.gender;
        const userInterests = userData.interests;
        const userLocation = userData.location;
        const userMatch = [];
        const matchRef = ref(db, 'users');
        const matchQuery = query(matchRef, orderByChild('age'), equalTo(userAge));
        const matchSnapshot = await get(matchQuery);
        if (matchSnapshot.exists()) {
          const matchData = matchSnapshot.val();
          Object.keys(matchData).forEach(key => {
            if (matchData[key].gender !== userGender && userInterests.some(i => matchData[key].interests.includes(i)) && matchData[key].location === userLocation) {
              userMatch.push(matchData[key]);
            }
          );
        } else {
          throw new Error('No matches found');
        }
        userMatch.forEach((match) => {
          delete match.password;
        });
        return { ...userData, userMatch };
    } else {
      throw new Error('User not found');
    }
  } catch (err) {
    console.error(`Error matching users: ${err.message}`);
    throw err;
  }
};
