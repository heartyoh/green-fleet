Ext.define('GreenFleet.view.Brand', {
	extend : 'Ext.panel.Panel',
	
	alias : 'widget.brand',
	
	//html : '<a></a>' ==> 기본으로 resources/image/logoGreenfleet.gif를 가리킨다. 
	
	initComponent : function() {
		this.callParent(arguments);		
		this.setCompanyLogo();		
	},
	
	setCompanyLogo : function() {
		var image = this.sub('image');
		
    	Ext.Ajax.request({
		    url: 'company/find',
		    method : 'GET',
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {		        	
		    		var companyLogo = resultObj.image_clip;
		    		var imgSrc = (companyLogo && companyLogo != '') ? ('download?blob-key=' + companyLogo) : 'resources/image/logoGreenfleet.gif';
		    		image.setSrc(imgSrc);		        	
		        } else {
		        	image.setSrc('resources/image/logoGreenfleet.gif');
		        }
		    },
		    failure: function(response) {
		    	image.setSrc('resources/image/logoGreenfleet.gif');
		    }
		});
	},

	items : [ {
		xtype : 'container',
		flex : 1,
		layout : 'fit',
		items : [ {
			xtype : 'image',
			itemId : 'image'
		} ]
	} ]

});