package com.heartyoh.dao;

import com.heartyoh.model.CustomUser;

public interface UserDao {

    CustomUser findUser(String userId);

    void registerUser(CustomUser newUser);

    void removeUser(String key);
}
