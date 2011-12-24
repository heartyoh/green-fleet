package com.heartyoh.greenfleet.model;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class Incident {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

	@Persistent
	private Date incidentTime;
	@Persistent
	private double lattitude;
	@Persistent
	private double longitude;
	@Persistent
	private double impulse;
	@Persistent
	private String videoClip;
}
