package com.heartyoh.util;

import java.util.UUID;

/**
 * GUID Generator
 * 
 * @author jhnam
 */
public class GUIDGenerator {
            
    public static synchronized String nextGUID(){
    	UUID uuid = UUID.randomUUID();
    	return uuid.toString();
    }
    
    public static void main(String[] args){
    	for(int i = 0; i < 10; i++) {
    		System.out.println(nextGUID());
    	}
    }
}