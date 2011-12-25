Ext.define('GreenFleet.view.vehicle.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.reservation',

	title : 'Reservation',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Reservation List',
			store : 'ReservationStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'id',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'reservedDate',
				text : 'Reserved Date',
				type : 'string'
			}, {
				dataIndex : 'driver',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'Vehicle Type',
				type : 'string'
			}, {
				dataIndex : 'deliveryPlace',
				text : 'Delivery Place',
				type : 'string'
			}, {
				dataIndex : 'destination',
				text : 'Destination',
				type : 'string'
			}, {
				dataIndex : 'purpose',
				text : 'Purpose',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dateFormat : 'YYYY-MM-DD',
				dataIndex : 'createdAt',
				text : 'CreatedAt',
				type : 'date'
			}, {
				dateFormat : 'YYYY-MM-DD',
				dataIndex : 'updaatedAt',
				text : 'UpdaatedAt',
				type : 'date'
			} ],
			viewConfig : {

			},
			listeners : {
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idfilter = grid.down('textfield[name=idFilter]');
				var vehicleFilter = grid.down('textfield[name=vehicleFilter]');
				grid.store.load({
					filters : [ {
						property : 'id',
						value : idfilter.getValue()
					}, {
						property : 'vehicle',
						value : vehicleFilter.getValue()
					} ]
				});
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=vehicleFilter]').setValue('');
			},
			tbar : [ 'Reservation ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Vehicle', {
				xtype : 'textfield',
				name : 'vehicleFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, {
				xtype : 'button',
				text : 'Search',
				tooltip : 'Find Reservation',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			bodyPadding : 10,
			title : 'Reservation Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Reservation ID',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'reservedDate',
				disabled : true,
				fieldLabel : 'Reserved Date',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'vehicleType',
				fieldLabel : 'Vehicle Type',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'vehicle',
				fieldLabel : 'Vehicle',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'status',
				fieldLabel : 'Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'deliveryPlace',
				fieldLabel : 'Delivery Place',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'destination',
				fieldLabel : 'Destination',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'purpose',
				fieldLabel : 'Purpose',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				anchor : '100%'
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				layout : {
					align : 'middle',
					type : 'hbox'
				},
				items : [ {
					xtype : 'button',
					text : 'Save',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'reservation/save',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Delete',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'reservation/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Reset',
					handler : function() {
						this.up('form').getForm().reset();
					}
				} ]
			} ]
		}
	}
});