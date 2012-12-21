Ext.define('GreenFleet.view.management.Company', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_company',

	title : T('title.company'),

	entityUrl : 'company',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">' + T('title.company_list') + '</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
			
			var image = self.sub('image');
			var value = record.raw.image_clip;
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');			
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});

		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})		
	},

	search : function(remote) {
		this.sub('grid').store.remoteFilter = remote;
		this.sub('grid').store.clearFilter(true);

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CompanyStore',
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.id')
			}, {
				dataIndex : 'name',
				text : T('label.name')
			}, {
				dataIndex : 'desc',
				text : T('label.desc')
			}, {
				dataIndex : 'timezone',
				text : T('label.timezone')
			}, {
				dataIndex : 'language',
				text : T('label.language')
			}, {
				dataIndex : 'address',
				text : T('label.address'),
				width : 150
			},{
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'number'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
				type : 'number'
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			onReset : function(grid) {
				grid.down('textfield[name=id_filter]').setValue('');
				grid.down('textfield[name=name_filter]').setValue('');
			},
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.company_details'),
			height : 380,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},			
			items : [ {
				xtype : 'form',
				itemId : 'form',
				flex : 1,
				autoScroll : true,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [ {
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'id',
					fieldLabel : T('label.id'),
					disabled : true
				}, {
					name : 'name',
					fieldLabel : T('label.name')
				}, {
					name : 'desc',
					fieldLabel : T('label.desc')
				}, {
					xtype : 'tzcombo',
					name : 'timezone',
					fieldLabel : T('label.timezone')
				}, {
					xtype : 'combo',
					name : 'language',
				    store: 'LanguageCodeStore',
				    queryMode: 'local',
				    displayField: 'display',
				    valueField: 'value',
					fieldLabel : T('label.language')
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
				}, {
					xtype: 'fieldcontainer',
	                fieldLabel: T('label.address'),
	                layout: 'hbox',
	                defaults: {
	                    hideLabel: true
	                },
	                items: [
	                    {
	                    	itemId : 'form_address',
	                        xtype : 'textfield',
	                        name : 'address',
	                        fieldLabel : T('label.address'),
	                        flex : 1
	                    },
	                    {
	                        xtype : 'button',
	                        text : T('button.search'),
	                        margin : '0 0 0 5',
	                        handler : function(btn, event) {
	                        	var companyView = btn.up('management_company');
	                        	var addressStr = btn.up('fieldcontainer').down('textfield').getValue();
	                        	companyView.refreshLocByAddr(addressStr);                        	
	                        }
	                    }
	                ]
				},{
					itemId : 'form_latitude',
					name : 'lat',
					fieldLabel : T('label.latitude')
				}, {
					itemId : 'form_longitude',
					name : 'lng',
					fieldLabel : T('label.longitude')					
				}, {
					xtype : 'datefield',
					name : 'updated_at',
					disabled : true,
					fieldLabel : T('label.updated_at'),
					format : F('datetime')
				}, {
					xtype : 'datefield',
					name : 'created_at',
					disabled : true,
					fieldLabel : T('label.created_at'),
					format : F('datetime')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				}  ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : 'fit',
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
					itemId : 'image'
				} ]
			} ],				
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						main.sub('id_filter').setValue('');
						main.sub('name_filter').setValue('');
						main.search(true);
						//main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	},
	
	refreshLocByAddr : function(address) {
		if(!address){
			Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_empty'));
			return;
		}
		var self = this;
		// 주소로 위치 검색
	    this.getGeocoder().geocode({'address': address}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {	    		
	    		var center = results[0].geometry.location;
	    		self.sub('form_latitude').setValue(center.lat());
	    		self.sub('form_longitude').setValue(center.lng());	
	      } else {
	    	  	Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_notfound', {x:address}));
	      }
	    });
	},
	
	getGeocoder : function() {
		if(!this.geocoder){
			this.geocoder = new google.maps.Geocoder();
		}
		return this.geocoder;
	},
});
