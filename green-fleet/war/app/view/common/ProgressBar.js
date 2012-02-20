Ext.define('GreenFleet.view.common.ProgressBar', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.progressbarcolumn',

	header: '&#160;',

	/**
	 * @cfg {number} min
	 * The min of the progress bar, for normalization purpose. Defaults to <tt>0</tt>
	 */
	min: 0,

	/**
	 * @cfg {number} max
	 * The max of the progress bar, for normalization purpose. Defaults to <tt>100</tt>
	 */
	max: 100,

	constructor: function (config) {

		var me = this;
		me.callParent(arguments);
		
		me.renderer = function (v, meta, rec, r, c, store, view) {
			setTimeout(function() {
				
				var row = view.getNode(rec);
				
				//v = Math.random()*100;
				
				var pb = Ext.create('Ext.ProgressBar', {
					renderTo: Ext.fly(Ext.fly(row).query('.x-grid-cell')[c]).down('div'),
					value: v,
					min: me.min,
					max: me.max
				});
				
//				me.on('resize', function(cp, w, h) {
//					pb.resize(w, h);
//				});
			}, 1000);
		};
	},
	
	/**
	 * Destroy?
	 */
	destroy: function() {
		delete this.renderer;
		delete this.pb;
		return this.callParent(arguments);
	}
});