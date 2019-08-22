# MagicMirror² : Display a system health on the mirror
A MagicMirror² modules for display a system health on the mirror such as shows the processor & gpu temperature, available RAM, uptime and free disk space.

## Installation
1. Navigate into your MagicMirror's `modules` folder
2. Execute `git clone https://github.com/putera/MMM-Stats.git`
3. Navigate to `cd ~/MagicMirror/modules/MMM-Stats` folder
4. Run `npm install`

## Using the module
To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
	{
		module: 'MMM-Stats',
		position: 'bottom_right',
		config: {
			// See 'Configuration options' for more information.
			units: 'metric', // kelvin, imperial
			label: 'textAndIcon',
			align: 'right'
		}
	}
]
```

## Configuration Options
The following properties can be configured:

| **Option** | **Description** |
| --- | --- |
| `updateInterval` | in seconds |
| `align` | Align the text on the display |
| `language` | Your choosen language |
| `units` | metric (*default*), kelvin, imperial |
| `thresholdCPUTemp` | Threshold CPU temperature |
| `label` | Label on the display |
