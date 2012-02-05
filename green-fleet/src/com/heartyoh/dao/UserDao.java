package com.heartyoh.dao;

import com.heartyoh.model.CustomUser;

public interface UserDao {

    CustomUser findUser(String userId);

    String registerUser(CustomUser newUser);

    void removeUser(String key);
}
