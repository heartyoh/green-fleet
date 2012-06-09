package com.heartyoh.security.service;

public class RegistrationForm {

    private String name;
    private String company;
    private String email;
    private String phoneNo;
    private boolean admin;
	private String language;
	private boolean prodEnv;

    public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }

	public String getPhoneNo() {
		return phoneNo;
	}

	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
    
    public boolean isAdmin() {
		return admin;
	}

	public void setAdmin(boolean admin) {
		this.admin = admin;
	}

	public boolean isProdEnv() {
		return prodEnv;
	}

	public void setProdEnv(boolean prodEnv) {
		this.prodEnv = prodEnv;
	}

}
