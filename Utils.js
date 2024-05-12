import User from "./Users.js"
import ProfilePic from "./Profilepic.js";
 const UserProfilePic = async (userIds,sex) => {
    let user_gander=sex===undefined?"1":sex
    try {
        const user = await ProfilePic.findOne({ user_id: userIds });
        if (!user) {
            let profile_img =user_gander==="1"? 'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/boypic.jpg?alt=media&token=6d9dc8a7-8c16-48d6-8df2-8e37c6cef89b':'https://firebasestorage.googleapis.com/v0/b/voter-29270.appspot.com/o/girlpic.jpg?alt=media&token=9227e456-c6ea-414f-87a0-991bce8b81a2'
            return profile_img
          }else{
           return  user.profile_img 
          }

    } catch (error) {
        console.error(`Error fetching user data: ${error}`);
        return {};
    }
};
export const Userdetails = async (userIds,socketId,location) => {
    try {
        const users = await User.find({ message_id:  userIds  });
        // console.log(users);
        const profilepic=await UserProfilePic(users[0]?.user_id,users[0]?.sex)
        // console.log(profilepic);
        const userMap = {};
        users.forEach((user) => {
            userMap[user.message_id] = { name: user.name, socketId:socketId,location:location,user_id:user._id,work_title:user.work_title||"",user_image:profilepic,message_id:  userIds 
         };
        });
        return userMap;
    } catch (error) {
        console.error(`Error fetching user data: ${error}`);
        return {};
    }
};
