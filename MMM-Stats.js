/*
    MagicMirror² : Display a system health on the mirror
    ==============================================================
    A MagicMirror² modules for display a system health on the mirror

    Developer : Zulkifli Mohamed (putera)
    E-mail : mr.putera@gmail.com
*/

Module.register('MMM-Stats', {
    defaults: {
        updateInterval: 10,
        animationSpeed: 0,
        align: 'right',
        tableAlign: 'right',
        language: config.language,
        units: config.units,
        thresholdCPUTemp: 60,
        label: 'textAndIcon'
    },

    getStyles: function() {
        return ["font-awesome.css"];
    },

    getScripts: function() {
        return ["moment.js", this.file("js/moment-duration-format.js")];
    },

    getTranslations: function() {
        return {
            'ms-my': 'translations/ms-my.json',
            'en': 'translations/en.json'
        };
    },

    start: function() {
        Log.log('[MMM-Stats] Starting module...');

        moment.locale(this.config.language);

        this.stats = {};
        this.stats.cpuTemp = "-";
        this.stats.gpuTemp = "-";
        this.stats.freeMem = "-";
        this.stats.upTime = "-";
        this.stats.freeSpace = "-";

        this.sendSocketNotification('CONFIG', this.config);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'STATS')
        {
            this.stats.cpuTemp = payload.cpuTemp;

            // Tell MMM-TelegramBot if temperature is reach threshold
            var cpuTemp = Math.ceil(parseFloat(this.stats.cpuTemp));
            if (cpuTemp > this.config.thresholdCPUTemp)
            {
                MM.getModules().enumerate((m) => {
                    if (m.name !== 'MMM-TelegramBot') {
                        this.sendNotification('TELBOT_TELL_ADMIN', this.translate("TEMP_THRESHOLD_WARNING"));
                    }
                });
            }

            this.stats.gpuTemp = payload.gpuTemp;
            this.stats.freeMem = Number(payload.freeMem).toFixed() + '%';
            upTime = parseInt(payload.upTime[0]);
            this.stats.upTime = moment.duration(upTime, "seconds").humanize();
            this.stats.freeSpace = payload.freeSpace;

            this.updateDom(this.config.animationSpeed);
        }
    },

    getDom: function() {
        var self = this;
        var wrapper = document.createElement('table');
        wrapper.style.width = this.config.width;
        wrapper.style.align = this.config.tableAlign;

        var sysData = {
            cpuTemp: {
                text: 'CPU_TEMP',
                icon: 'fa-thermometer'
            },
            gpuTemp: {
                text: 'GPU_TEMP',
                icon: 'fa-thermometer'
            },
            freeMem: {
                text: 'RAM_FREE',
                icon: 'fa-microchip'
            },
            upTime: {
                text: 'UPTIME',
                icon: 'fa-clock-o'
            },
            freeSpace: {
                text: 'DISK_FREE',
                icon: 'fa-hdd-o'
            }
        };

        Object.keys(sysData).forEach(function(item)
        {
            var row = document.createElement('tr');

            if (self.config.label.match(/^(text|textAndIcon)$/)) {
                var c1 = document.createElement('td');
                c1.setAttribute('class', 'title');
                c1.style.textAlign = self.config.align;
                c1.innerText = self.translate(sysData[item].text);
                row.appendChild(c1);
            }

            if (self.config.label.match(/^(icon|textAndIcon)$/)) {
                var c2 = document.createElement('td');
                c2.innerHTML = ` &nbsp; <i class="fa ${sysData[item].icon} fa-fw"></i>`;
                row.appendChild(c2);
            }

            var c3 = document.createElement('td');
            c3.setAttribute('class', 'value');
            c3.style.textAlign = self.config.align;
            c3.innerText = self.stats[item];
            row.appendChild(c3);

            wrapper.appendChild(row);
        });

        return wrapper;
    },
});
