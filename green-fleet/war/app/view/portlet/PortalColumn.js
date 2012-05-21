/**
 * @class GreenFleet.view.portlet.PortalColumn
 * @extends Ext.container.Container
 * A layout column class used internally be {@link GreenFleet.view.portlet.PortalPanel}.
 */
Ext.define('GreenFleet.view.portlet.PortalColumn', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',
    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column'

    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
});