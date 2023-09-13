function getTempHsl(value) {
  // TODO: change color range
  const h = 240 - 240 * (value / 100);
  return 'hsl(' + h + ',85%,50%)';
}

function getTempTextBorderHsl(value) {
  const h = 240 - 240 * (value / 100);
  return 'hsl(' + h + ',85%,40%)';
}

function getTempShadowHsl(value) {
  const h = 240 - 240 * (value / 100);
  return 'hsl(' + h + ',85%,50%)';
}

function getAxisLineColor() {
  const theme = localStorage.getItem('preference-theme') || 'light';
  return theme == 'dark' ? '#43484d' : '#e6ebf8';
}

function getGaugeTitle(count, text) {
  let match = text.match(/^CPU Core #([0-9]+)$/);
  if (match) {
    // TODO: multiple CPUs
    return '{value|\uF2D6}\n{n|Core #' + match[1] + '}';
  }
  if (text == 'GPU Core') {
    return '{value|\uF6E2}\n{n|#' + count + ' Core}';
  }
  if (text == 'GPU Hot Spot') {
    return '{value|\uF6E2}\n{n|#' + count + ' Hot Spot}';
  }
  if (text == 'Motherboard') {
    return '{value|\uF6E7}\n{n|Max}'
  }
  if (text == 'Storage') {
    return '{value|\uF412}\n{n|#' + count + ' Max}'
  }
  return '{value|}\n{n|unknown}';
}

function createTooltip(element, text) {
  element.setAttribute('data-bs-title', text);
  new bootstrap.Tooltip(element, {
    animation: true,
    trigger: 'hover'
  });
}

function createGauge(element, count, label, tempValue, load1Value, load2Value) {
  let chart = echarts.init(element, null, {
    renderer: 'svg' // For beautiful zooming
  });
  let animationDuration = 900;
  let option = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '65%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        animation: true,
        animationDuration: animationDuration,
        itemStyle: {
          color: getTempHsl(tempValue),
          shadowBlur: 3,
          shadowColor: getTempShadowHsl(tempValue),
        },
        pointer: {
          show: false,
        },
        anchor: {
          show: false,
        },
        progress: {
          show: true,
          width: 8,
          roundCap: true,
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 8,
            color: [[1, getAxisLineColor()]]
          }
        },
        axisTick: {
          distance: -17,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        splitLine: {
          distance: -20,
          length: 10,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          show: true,
          distance: -18,
          color: '#999',
          fontSize: 11
        },
        title: {
          show: true,
          offsetCenter: [0, -16],
          rich: {
            value: {
              fontFamily: 'bootstrap-icons',
              fontSize: 28,
              color: '#999'
            },
            n: {
              fontSize: 11,
              color: '#999',
              padding: [5, 0, 0, 0]
            }
          }
        },
        detail: {
          valueAnimation: true,
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [6, '50%'],
          color: 'inherit',
          textBorderWidth: 1,
          textBorderColor: getTempTextBorderHsl(tempValue),
          formatter: function(value) {
            return '{value|' + value.toFixed(0) + '}{unit|°C}';
          },
          rich: {
            value: {
              fontSize: 36,
              fontWeight: 'bolder',
            },
            unit: {
              fontSize: 12,
              fontWeight: 'bolder',
              padding: [0, 0, -8, 2]
            }
          }
        },
        data: [
          {
            name: getGaugeTitle(count, label),
            value: tempValue,
          },
        ]
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '55%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        animation: true,
        animationDuration: animationDuration,
        itemStyle: {
          color: '#999'
        },
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          width: 2,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          show: false,
        },
        data: [
          {
            value: load1Value,
          },
        ]
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '52%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        animation: true,
        animationDuration: animationDuration,
        itemStyle: {
          color: '#999'
        },
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          width: 2,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          show: false,
        },
        data: [
          {
            value: load2Value,
          },
        ]
      },
    ]
  };
  chart.setOption(option);
}

function updateGauge() {
  // TODO
}

function getCPULoadMap(loadProp) {
  const loadMap = {};
  for (let load of loadProp.Children) {
    const match = load.Text.match(/^(CPU Core #[0-9]+)(| Thread #([0-9]+))$/);
    if (!match) {
      continue;
    }
    const loadValue = Number(load.Value.split(" ")[0]);
    if (!loadMap[match[1]]) {
      loadMap[match[1]] = [0, 0];
    }
    let thread = match[3] ? parseInt(match[3]-1) : 0;
    loadMap[match[1]][thread] = loadValue;
  }
  return loadMap;
}

function createCPUElement(data) {
  let cpuCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/cpu.png')) {
      continue;
    }
    cpuCount++;
    let loadMap = {};
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/load.png')) {
        continue;
      }
      loadMap = getCPULoadMap(prop);
    }
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        const gauge = document.createElement('div');
        gauge.id = 'cpu-' + temp.id;
        gauge.className = 'gauge';
        $("#gauge-container").append(gauge);
        createTooltip(gauge, component.Text);
        const tempValue = Number(temp.Value.split(" ")[0]);
        createGauge(gauge, cpuCount, temp.Text, tempValue,
          loadMap[temp.Text][0], loadMap[temp.Text][1]);
      }
    }
  }
}

function updateCPUElement(data) {
  let cpuCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/cpu.png')) {
      continue;
    }
    cpuCount++;
    let loadMap = {};
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/load.png')) {
        continue;
      }
      loadMap = getCPULoadMap(prop);
    }
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        const dom = document.getElementById("cpu-" + temp.id);
        const tempValue = Number(temp.Value.split(" ")[0]);
        const color = getTempHsl(tempValue);
        const chart = echarts.getInstanceByDom(dom);
        chart.setOption({
          series: [
            {
              itemStyle: {
                color: color,
                shadowColor: getTempShadowHsl(tempValue),
              },
              anchor: {
                itemStyle: {
                  borderColor: color
                }
              },
              detail: {
                textBorderColor: getTempTextBorderHsl(tempValue),
              },
              data: [
                {
                  name: getGaugeTitle(cpuCount, temp.Text),
                  value: tempValue,
                },
              ]
            },
            {
              data: [
                {
                  value: loadMap[temp.Text][0]
                }
              ]
            },
            {
              data: [
                {
                  value: loadMap[temp.Text][1]
                }
              ]
            }
          ]
        });
      }
    }
  }
}

function createGPUElement(data) {
  let gpuCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/nvidia.png') &&
      !component.ImageURL.endsWith('/ati.png') &&
      !component.ImageURL.endsWith('/intel.png')) {
      continue;
    }
    gpuCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        const gauge = document.createElement('div');
        gauge.id = 'gpu-' + temp.id;
        gauge.className = 'gauge';
        $("#gauge-container").append(gauge);
        createTooltip(gauge, component.Text);
        const tempValue = Number(temp.Value.split(" ")[0]);
        createGauge(gauge, gpuCount, temp.Text, tempValue, 0, 0);
      }
    }
  }
}

function updateGPUElement(data) {
  let gpuCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/nvidia.png') &&
      !component.ImageURL.endsWith('/ati.png') &&
      !component.ImageURL.endsWith('/intel.png')) {
      continue;
    }
    gpuCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        const dom = document.getElementById("gpu-" + temp.id);
        const tempValue = Number(temp.Value.split(" ")[0]);
        const color = getTempHsl(tempValue);
        const chart = echarts.getInstanceByDom(dom);
        chart.setOption({
          series: [
            {
              itemStyle: {
                color: color,
                shadowColor: getTempShadowHsl(tempValue),
              },
              anchor: {
                itemStyle: {
                  borderColor: color
                }
              },
              detail: {
                textBorderColor: getTempTextBorderHsl(tempValue),
              },
              data: [
                {
                  name: getGaugeTitle(gpuCount, temp.Text),
                  value: tempValue,
                },
              ]
            }
          ]
        });
      }
    }
  }
}

function createMotherboardElement(data) {
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/mainboard.png')) {
      continue;
    }
    const chip = component.Children[0];
    if (!chip.ImageURL.endsWith('/chip.png')) {
      continue;
    }
    for (let prop of chip.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature #[0-9]+$/)) {
          continue;
        }
        // console.log(temp);
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      const gauge = document.createElement('div');
      gauge.id = 'motherboard';
      gauge.className = 'gauge';
      $("#gauge-container").append(gauge);
      createTooltip(gauge, component.Text);
      createGauge(gauge, 1, 'Motherboard', maxTempValue, 0, 0);
    }
    break;
  }
}

function updateMotherboardElement(data) {
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/mainboard.png')) {
      continue;
    }
    const chip = component.Children[0];
    if (!chip.ImageURL.endsWith('/chip.png')) {
      continue;
    }
    for (let prop of chip.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }

      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature #[0-9]+$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      const dom = document.getElementById("motherboard");
      const color = getTempHsl(maxTempValue);
      const chart = echarts.getInstanceByDom(dom);
      chart.setOption({
        series: [
          {
            itemStyle: {
              color: color,
              shadowColor: getTempShadowHsl(maxTempValue),
            },
            anchor: {
              itemStyle: {
                borderColor: color
              }
            },
            detail: {
              textBorderColor: getTempTextBorderHsl(maxTempValue),
            },
            data: [
              {
                name: getGaugeTitle(1, 'Motherboard'),
                value: maxTempValue,
              },
            ]
          }
        ]
      });
    }
    break;
  }
}

function createStorageElement(data) {
  let storageCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/hdd.png')) {
      continue;
    }
    storageCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature [0-9]+$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      const gauge = document.createElement('div');
      gauge.id = 'storage-' + component.id;
      gauge.className = 'gauge';
      $("#gauge-container").append(gauge);
      createTooltip(gauge, component.Text);
      createGauge(gauge, storageCount, 'Storage', maxTempValue, 0, 0);
    }
  }
}

function updateStorageElement(data) {
  let storageCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/hdd.png')) {
      continue;
    }
    storageCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }

      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature [0-9]+$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      const dom = document.getElementById("storage-" + component.id);
      const color = getTempHsl(maxTempValue);
      const chart = echarts.getInstanceByDom(dom);
      chart.setOption({
        series: [
          {
            itemStyle: {
              color: color,
              shadowColor: getTempShadowHsl(maxTempValue),
            },
            anchor: {
              itemStyle: {
                borderColor: color
              }
            },
            detail: {
              textBorderColor: getTempTextBorderHsl(maxTempValue),
            },
            data: [
              {
                name: getGaugeTitle(storageCount, 'Storage'),
                value: maxTempValue,
              },
            ]
          }
        ]
      });
    }
  }
}

var pollingIntervalId = null;

function startMonitoring() {
  const dataURL = localStorage.getItem('preference-url') + '/data.json';

  $('#spinner-body-container').show();
  $.ajax({
    type: "GET",
    url: dataURL,
    dataType: "json",
  }).done(function(data) {
    $('#spinner-body-container').hide();

    createCPUElement(data);
    createGPUElement(data);
    createMotherboardElement(data);
    createStorageElement(data);

    pollingIntervalId = setInterval(function() {
      $.ajax({
        type: "GET",
        url: dataURL,
        dataType: "json",
      }).done(function(data) {
        updateCPUElement(data);
        updateGPUElement(data);
        updateMotherboardElement(data);
        updateStorageElement(data);
      }).fail(function(data) {
        // TODO
      });
    }, 1000); // TODO: make it customizable
  }).fail(function(data) {
    $('#spinner-body-container').hide();

    $('#preference-url').addClass('is-invalid');
    $('#btn-preferences').trigger('click');
  });
}

function clearMonitoring() {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
  $('#gauge-container').empty();
  $('#preference-url').removeClass('is-invalid');
}

function changeColor() {
  const theme = localStorage.getItem('preference-theme') || 'light';
  $('html').attr('data-bs-theme', theme);
  $('.gauge').each(function() {
    let chart = echarts.getInstanceByDom(this);
    chart.setOption({
      series: [
        {
          axisLine: {
            lineStyle: {
              color: [[1, getAxisLineColor()]]
            }
          },
        }
      ]
    });
  });
}

function initializeColorMode() {
  const theme = localStorage.getItem('preference-theme') || 'light';
  $('#preference-theme').attr('checked', theme == 'dark');
  changeColor();
}

function initializeWebServerURL() {
  let url = localStorage.getItem('preference-url');
  if (!url) {
    url = 'http://localhost:8085';
    localStorage.setItem('preference-url', url);
  }
  $('#preference-url').val(url);
}

function changeColorMode(checked) {
  localStorage.setItem('preference-theme', checked ? 'dark' : 'light');
  changeColor();
}

document.getElementById('modal-preferences').addEventListener('hidden.bs.modal', (event) => {
  const serverURL = ($('#preference-url').val() || '').trim();
  localStorage.setItem('preference-url', serverURL);

  clearMonitoring();
  startMonitoring();
});

$(document).ready(function() {
  initializeColorMode();
  initializeWebServerURL();

  startMonitoring();
});
