/*
    MagicMirror² : Display a system health on the mirror
    ==============================================================
    A MagicMirror² modules for display a system health on the mirror

    Developer : Zulkifli Mohamed (putera)
    E-mail : mr.putera@gmail.com
*/

const NodeHelper = require('node_helper');
var async = require('async');
var exec = require('child_process').exec;
var request = require('request');

module.exports = NodeHelper.create({
    start: function() {
        console.log('[MMM-Stats] Starting node helper...');
    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;

        if (notification === 'CONFIG')
        {
            this.config = payload;
            self.getStats();
      
            setInterval(function() {
                self.getStats();
            }, this.config.updateInterval * 1000);
        }
    },

    getStats: function() {
        var self = this;

        var temp_conv = '';
        switch (this.config.units) {
            case "imperial":
                temp_conv = 'awk \'{printf("%.1f°F\\n",(($1*1.8)/1e3)+32)}\'';
            break;
            case "kelvin":
                temp_conv = 'awk \'{printf("%.1f°K\\n",($1/1e3)+273.15)}\'';
            break;
            case "default":
            default:
                // metric
                temp_conv = 'awk \'{printf("%.1f°C\\n",$1/1e3)}\'';
            break;
        }

        async.parallel([
            // get cpu temp
            async.apply(exec, temp_conv + ' /sys/class/thermal/thermal_zone0/temp'),
            // get gpu temp
            async.apply(exec, "/opt/vc/bin/vcgencmd measure_temp | awk -F\"=|'\" '{print $2\"°C\"}'"),
            // get free ram in %
            async.apply(exec, "free | awk '/^Mem:/ {print $4*100/$2}'"),
            // get uptime
            async.apply(exec, 'cat /proc/uptime'),
            // get root free-space
            async.apply(exec, "df -h|grep /dev/root|awk '{print $4}'"),
        ],
        function (err, res) {
            var stats = {};
            stats.cpuTemp = res[0][0];
            stats.gpuTemp = res[1][0];
            stats.freeMem = res[2][0];
            stats.upTime = res[3][0].split(' ');
            stats.freeSpace = res[4][0];

            self.sendSocketNotification('STATS', stats);
        });
    }
});
