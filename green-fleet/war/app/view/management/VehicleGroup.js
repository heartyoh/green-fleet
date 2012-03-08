Ext.define('GreenFleet.view.management.VehicleGroup', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle_group',

	title : 'Vehicle Group',

	entityUrl : 'vehicle_group',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'vehicle_group/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	currentVehicleGroup : '',
	
	initComponent : function() {
		var self = this;

		this.items = [ {
			html : '<div class="listTitle"></div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildVehicleGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.buildVehicleGroupForm(this), this.buildGroupedVehicleList(this) ]
			} ]
		} ],

		this.callParent(arguments);
		
		this.sub('grouped_vehicles_grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('itemclick', function(grid, record) {			
			self.currentVehicleGroup = record.get('id');			
			self.sub('grouped_vehicles_grid').setTitle("Vehicles By Group [" + record.get('id') + "]");
			self.sub('form').setTitle("Group [" + record.get('id') + "] Details");
			
			self.sub('form').getForm().reset();
			self.sub('form').getForm().setValues({
				key : record.get('key'),
				id : record.get('id'),
				desc : record.get('desc'),
				updated_at : record.get('updated_at'),
				created_at : record.get('created_at')
			});
			
			self.searchGroupedVehicles();
		});
		
		this.sub('grouped_vehicles_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_group_id'] = self.currentVehicleGroup;
			operation.params['select'] = ['id', 'registration_number', 'manufacturer', 'vehicle_type', 'birth_year', 'status', 'total_distance', 'lattitude', 'longitude'];
		});		
				
		this.down('#search_all_vehicles').on('click', function() {
			self.searchAllVehicles();
		});	
		
		this.down('#search_reset_all_vehicles').on('click', function() {
			self.sub('all_vehicles_id_filter').setValue('');
			self.sub('all_vehicles_reg_no_filter').setValue('');
		});
		
		this.sub('all_vehicles_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			var vehicle_id_filter = self.sub('all_vehicles_id_filter');
			var reg_no_filter = self.sub('all_vehicles_reg_no_filter');
			operation.params['vehicle_id'] = vehicle_id_filter.getSubmitValue();
			operation.params['registration_number'] = reg_no_filter.getSubmitValue();
		});
		
		this.down('button[itemId=moveLeft]').on('click', function(button) {
			
			if(!self.currentVehicleGroup) {
				Ext.MessageBox.alert("None Selected!", "Select vehicle group first!");
				return;				
			}
			
			var selections = self.sub('all_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert("None Selected!", "Select the vehicles to add vehicle group [" + self.currentVehicleGroup + "]");
				return;
			}

			var vehicle_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				vehicle_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/vehicle_relation/save',
			    method : 'POST',
			    params: {
			        vehicle_group_id: self.currentVehicleGroup,			        
			        vehicle_id : vehicle_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {			        	
				        self.sub('all_vehicles_grid').getSelectionModel().deselectAll(true);
				        self.searchGroupedVehicles();
			        } 
			        
			        Ext.MessageBox.alert((resultObj ? "Success" : "Failure"), resultObj.msg);
			    },
			    failure: function(response) {
			        var text = response.responseText;
			        Ext.MessageBox.alert("Failure", text);
			    }
			});			
 		});
		
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentVehicleGroup) {
				Ext.Msg.alert("No Selection!", "Select vehicle group first!");
				return;				
			}
			
			var selections = self.sub('grouped_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert("No Selection!", "Select the vehicles to remove from vehicle group [" + self.currentVehicleGroup + "]");
				return;
			}

			var vehicle_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				vehicle_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/vehicle_relation/delete',
			    method : 'POST',
			    params: {
			        vehicle_group_id: self.currentVehicleGroup,			        
			        vehicle_id : vehicle_id_to_delete
			    },
			    success: function(response){
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {
				        self.searchGroupedVehicles();
			        } 
			        
			        Ext.MessageBox.alert((resultObj ? "Success" : "Failure"), resultObj.msg);
			    },
			    failure: function(response) {
			        var text = response.responseText;
			        Ext.MessageBox.alert("Failure", text);
			    }
			});			
		});		
	},
	
	searchAllVehicles : function() {
		this.sub('all_vehicles_pagingtoolbar').moveFirst();
	},	
	
	searchGroupedVehicles : function() {
		this.sub('grouped_vehicles_pagingtoolbar').moveFirst();
	},

	buildVehicleGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'VehicleGroupStore',
			title : 'Vehicle Group',
			width : 320,
			columns : [ new Ext.grid.RowNumberer(), 
			{
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Group',
				width : 100
			}, {
				dataIndex : 'desc',
				text : 'Description',
				width : 220
			}, {
				dataIndex : 'created_at',
				hidden : true
			}, {
				dataIndex : 'updated_at',
				hidden : true
			} ]
		}
	},

	buildGroupedVehicleList : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [
			 	{
			 		xtype : 'gridpanel',
			 		itemId : 'grouped_vehicles_grid',
			 		store : 'VehicleStore',
			 		title : 'Vehicles By Group',
			 		flex : 20,
			 		cls : 'hIndexbarZero',
			 		selModel : new Ext.selection.CheckboxModel(),
			 		columns : [ 
			 		    {	
			 		    	dataIndex : 'key',
			 		    	text : 'Key',
			 		    	hidden : true
			 		    }, {
			 		    	dataIndex : 'id',
			 		    	text : 'Vehicle Id'
			 		    }, {
			 		    	dataIndex : 'registration_number',
			 		    	text : 'Registration Number'
			 		    }, {
			 		    	dataIndex : 'manufacturer',
			 		    	text : 'Manufacturer',
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'vehicle_type',
			 		    	text : 'VehicleType',
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'birth_year',
			 		    	text : 'BirthYear',
			 		    	type : 'string'
			 		    }, {
							dataIndex : 'ownership_type',
							text : 'OwnershipType',
							type : 'string'
						}, {
							dataIndex : 'status',
							text : 'Status',
							type : 'string'
						}, {
							dataIndex : 'total_distance',
							text : 'TotalDistance',
							type : 'string'
						}, {
							dataIndex : 'lattitude',
							text : 'Lattitude'
						}, {
							dataIndex : 'longitude',
							text : 'Longitude'
						}
			 		],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'grouped_vehicles_pagingtoolbar',
			            store: 'VehicleStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying vehicles {0} - {1} of {2}',
			            emptyMsg: "No vehicles to display"
			        }			 		
			 	},
			 	{
			 		xtype : 'panel',
			 		flex : 1,
					layout : {
						type : 'vbox',
						align : 'center',
						pack : 'center'
					},			 		
			 		items : [
			 		     {
			 		    	 xtype : 'button',
			 		    	 itemId : 'moveLeft',
			 		    	 text : '<<',
			 		     },
			 		     {
			 		    	 xtype : 'label',
			 		    	 margins: '5 0 5 0'
			 		     },
			 		     {
			 		    	 xtype : 'button',
			 		    	itemId : 'moveRight',
			 		    	 text : ">>"
			 		     }
			 		]
			 	},
			 	{
			 		xtype : 'gridpanel',
			 		itemId : 'all_vehicles_grid',
			 		store : 'VehicleBriefStore',
			 		title : 'Vehicle List',
			 		flex : 10,
			 		cls : 'hIndexbarZero',
			 		autoScroll : true,
			 		selModel : new Ext.selection.CheckboxModel(),
			 		columns : [ 
			 		    {	
			 		    	dataIndex : 'key',
			 		    	text : 'Key',
			 		    	hidden : true
			 		    }, {
			 		    	dataIndex : 'image_clip',
			 		    	text : 'Image',
			 		    	width : 100,
			 		    	renderer : function(image_clip) {			 		    		
				 		   		var imgTag = "<img src='";
				 				
				 				if(image_clip) {
				 					imgTag += "download?blob-key=" + image_clip;
				 				} else {
				 					imgTag += "resources/image/bgVehicle.png";
				 				}
				 				
				 				imgTag += "' width='100' height='100'/>";
				 				return imgTag;
			 		    	}
			 		    }, {
			 		    	dataIndex : 'id',
			 		    	text : 'Vehicle Id'
			 		    }, {
			 		    	dataIndex : 'registration_number',
			 		    	text : 'Registration Number'
			 		    } 
			 		],
					tbar : [ 'ID', {
						xtype : 'textfield',
						name : 'all_vehicles_id_filter',
						itemId : 'all_vehicles_id_filter',
						hideLabel : true,
						width : 100
					}, 'Registeration Number', {
						xtype : 'textfield',
						name : 'all_vehicles_reg_no_filter',
						itemId : 'all_vehicles_reg_no_filter',
						hideLabel : true,
						width : 100
					}, '  ', {
						text : 'Search',
						itemId : 'search_all_vehicles'
					}, '  ', {
						text : 'Reset',
						itemId : 'search_reset_all_vehicles'
					} ],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'all_vehicles_pagingtoolbar',
			            store: 'VehicleBriefStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying vehicles {0} - {1} of {2}',
			            emptyMsg: "No vehicles to display"
			        }
			 	}
			 ]
		}
	},

	buildVehicleGroupForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Group Details',
			height : 200,
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
				fieldLabel : 'Vehicle Group Id',
			}, {
				name : 'desc',
				fieldLabel : 'Description'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						main.sub('grid').store.load(callback);
						this.searchGroupedVehicles();
					},
					scope : main
				}
			} ]
		}
	}
});