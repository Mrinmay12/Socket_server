import User from "./Users.js"


export const Userdetails = async (userIds) => {
    try {
        const users = await User.find({ message_id: { $in: userIds } });
        const userMap = {};
        users.forEach((user) => {
            userMap[user.message_id] = { name: user.name, sex: user.sex,message_id:user.message_id,user_id:user.user_id };
        });
        return userMap;
    } catch (error) {
        console.error(`Error fetching user data: ${error}`);
        return {};
    }
};
