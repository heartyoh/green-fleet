Ext.define('GreenFleet.view.viewport.East', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.east',
	
	cls : 'summaryBoard',
	
	width : 200,

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'combo',
		cls : 'searchField',
		fieldLabel : 'Search',
		labelWidth : 50,
		labelSeparator : '',
		itemId : 'search'
	}, {
		xtype : 'component',
		cls : 'time',
		itemId : 'time',
		html : Ext.Date.format(new Date(), 'D Y-m-d H:i:s')
	}, {
		xtype : 'component',
		cls : 'count',
		itemId : 'vehicle_count',
		html : 'Total Running Vehicles : 6'
	}, {
		xtype : 'panel',
		title : '상황별 운행 현황',
		cls : 'statusPanel',
		items : [ {
			xtype : 'button',
			flex : 1,
			cls : 'btnDriving',
			html : 'Driving</br><span>4</span>'
		}, {
			xtype : 'button',
			flex : 1,
			cls : 'btnStop',
			html : 'Stop</br><span>2</span>'
		}, {
			xtype : 'button',
			flex : 1,
			cls : 'btnIncident',
			html : 'Incident</br><span>1</span>'
		} ]
	}, {
		xtype : 'panel',
		title : 'Group',
		cls :'groupPanel',
		items : [{
			html : '<a href="#">강남 ~ 분당노선 1 <span>(14)</span></a><a href="#">강남 ~ 분당노선 1 <span>(14)</span></a>'
		}]
	}, {
		xtype : 'panel',
		title : 'Incidents Alarm',
		cls : 'incidentPanel',
		items : [{
			html : '<a href="#">id_KS937362, 김형용<span>2011.12.30 16:25:41</span></a><a href="#">id_KS937362, 변사또<span>2011.12.30 16:25:41</span></a>'
		}]
	} ]
});