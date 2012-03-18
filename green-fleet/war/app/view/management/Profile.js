Ext.define('GreenFleet.view.management.Profile', {
	extend : 'Ext.window.Window',

	title : T('menu.profile'),
	
	modal : true,

	width : 560,
	height : 360,

	items : [ {
		xtype : 'form',
		itemId : 'form',
		bodyPadding : 10,
		flex : 1,
		autoScroll : true,
		layout : {
			type : 'table',
			columns : 2
		},
		defaults : {
			xtype : 'textfield',
			anchor : '100%'
		},
		items : [ {
			xtype : 'container',
			rowspan : 8,
			layout : {
				type : 'vbox',
				align : 'stretch'	
			},
			cls : 'noImage',
			items : [ {
				xtype : 'image',
				height : '100%',
				itemId : 'image'
			} ]			    	
		}, {
			name : 'key',
			fieldLabel : 'Key',
			hidden : true
		}, {
			name : 'name',
			fieldLabel : T('label.name')
		}, {
			name : 'email',
			fieldLabel : T('label.email')
		}, {
			xtype : 'checkbox',
			name : 'enabled',
			fieldLabel : T('label.enabled'),
			uncheckedValue : 'off'
		}, {
			xtype : 'checkbox',
			name : 'admin',
			fieldLabel : T('label.admin'),
			uncheckedValue : 'off'
		}, {
			name : 'company',
			fieldLabel : T('label.company'),
			disable : true
		}, {
			xtype : 'combo',
			name : 'language',
			store : 'LanguageCodeStore',
			queryMode : 'local',
			displayField : 'display',
			valueField : 'value',
			fieldLabel : T('label.language')
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
		}, {
			xtype : 'filefield',
			name : 'image_file',
			fieldLabel : T('label.image_upload'),
			msgTarget : 'side',
			allowBlank : true,
			buttonText : T('button.file')
		} ]
	} ],

	buttons : [ {
		text : 'Save',
		itemId : 'save'
	}, {
		text : 'Close',
		itemId : 'close'
	} ],

	initComponent : function() {

		this.callParent(arguments);

		var self = this;

		this.down('[itemId=close]').on('click', function(button) {
			self.close();
		});

		this.down('[itemId=save]').on('click', function(button) {
			var form = self.down('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : '/user/save',
					success : function(form, action) {
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result);
					}
				});
			}
		});
	}

});