function getHsl(value) {
  const h = 240 - 240 * (value / 100)
  return 'hsl(' + h + ',85%,50%)';
}
function getBorderHsl(value) {
  const h = 240 - 240 * (value / 100)
  return 'hsl(' + h + ',85%,40%)';
}
function getShadowHsl(value) {
  const h = 240 - 240 * (value / 100)
  return 'hsl(' + h + ',85%,50%)';
}
function getAxisLineColor() {
  const theme = localStorage.getItem('preference-theme') || 'light';
  return theme == 'dark' ? '#43484d' : '#e6ebf8';
}
function getTitle(count, text) {
  let match = text.match(/^CPU Core #([0-9]+)$/);
  if (match) {
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
function getTheme() {
  //const toggle = document.getElementsByName('toggle')[0];
  //return toggle.checked ? 'dark' : null;
  return null;
}
function createTooltip(element, text) {
  element.setAttribute('data-bs-title', text);
  new bootstrap.Tooltip(element, {
    animation: true,
    trigger: 'hover'
  });
}

function createCPUGauge(element, count, label, tempValue, load1Value, load2Value) {
  let chart = echarts.init(element, getTheme(), {
    renderer: 'svg'
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
          color: getHsl(tempValue),
          shadowBlur: 3,
          shadowColor: getShadowHsl(tempValue),
        },
        pointer: {
          show: false,
          length: '12%',
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          // offsetCenter: [0, '-102%'],
          offsetCenter: [0, '-62%'],
          itemStyle: {
            color: '#999',
          }
        },
        anchor: {
          show: false,
          showAbove: true,
          size: 20,
          itemStyle: {
            borderWidth: 6,
            borderColor: getHsl(tempValue)
          }
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
          // fontSize: 25,
          // fontWeight: 'bolder',
          // formatter: '{value} °C',
          color: 'inherit',
          textBorderWidth: 1,
          textBorderColor: getBorderHsl(tempValue),
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
            name: getTitle(count, label),
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

function getLoadMap(loadProp) {
  const loadMap = {};
  for (let load of loadProp.Children) {
    const match = load.Text.match(/^(CPU Core #[0-9]+)(| Thread #([0-9]+))$/);
    // console.log(match);
    //console.log(load);
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
    // $("#cpu-name").text(component.Text);
    let loadMap = {};
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/load.png')) {
        continue;
      }
      loadMap = getLoadMap(prop);
    }
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        // console.log(temp);
        let gauge = document.createElement('div');
        gauge.id = 'cpu-' + temp.id;
        gauge.className = 'cpu-gauge';
        $("#cpu-container").append(gauge);
        createTooltip(gauge, component.Text);
        let tempValue = Number(temp.Value.split(" ")[0]);
        createCPUGauge(gauge, cpuCount, temp.Text, tempValue,
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
      loadMap = getLoadMap(prop);
    }
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        // console.log(temp);
        let dom = document.getElementById("cpu-" + temp.id);
        let tempValue = Number(temp.Value.split(" ")[0]);
        let color = getHsl(tempValue);
        let chart = echarts.getInstanceByDom(dom);
        chart.setOption({
          series: [
            {
              itemStyle: {
                color: color,
                shadowColor: getShadowHsl(tempValue),
              },
              anchor: {
                itemStyle: {
                  borderColor: color
                }
              },
              detail: {
                textBorderColor: getBorderHsl(tempValue),
              },
              data: [
                {
                  name: getTitle(cpuCount, temp.Text),
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
    if (!component.ImageURL.endsWith('/nvidia.png')) {
      continue;
    }
    gpuCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        let gauge = document.createElement('div');
        gauge.id = 'gpu-' + temp.id;
        gauge.className = 'cpu-gauge';
        $("#cpu-container").append(gauge);
        createTooltip(gauge, component.Text);
        let tempValue = Number(temp.Value.split(" ")[0]);
        createCPUGauge(gauge, gpuCount, temp.Text, tempValue, 0, 0);
      }
    }
  }
}

function updateGPUElement(data) {
  let gpuCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/nvidia.png')) {
      continue;
    }
    gpuCount++;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        let dom = document.getElementById("gpu-" + temp.id);
        let tempValue = Number(temp.Value.split(" ")[0]);
        let color = getHsl(tempValue);
        let chart = echarts.getInstanceByDom(dom);
        chart.setOption({
          series: [
            {
              itemStyle: {
                color: color,
                shadowColor: getShadowHsl(tempValue),
              },
              anchor: {
                itemStyle: {
                  borderColor: color
                }
              },
              detail: {
                textBorderColor: getBorderHsl(tempValue),
              },
              data: [
                {
                  name: getTitle(gpuCount, temp.Text),
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
      let gauge = document.createElement('div');
      gauge.id = 'motherboard';
      gauge.className = 'cpu-gauge';
      $("#cpu-container").append(gauge);
      createTooltip(gauge, component.Text);
      createCPUGauge(gauge, 1, 'Motherboard', maxTempValue, 0, 0);
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
      let dom = document.getElementById("motherboard");
      let color = getHsl(maxTempValue);
      let chart = echarts.getInstanceByDom(dom);
      chart.setOption({
        series: [
          {
            itemStyle: {
              color: color,
              shadowColor: getShadowHsl(maxTempValue),
            },
            anchor: {
              itemStyle: {
                borderColor: color
              }
            },
            detail: {
              textBorderColor: getBorderHsl(maxTempValue),
            },
            data: [
              {
                name: getTitle(1, 'Motherboard'),
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
      let gauge = document.createElement('div');
      gauge.id = 'storage-' + component.id;
      gauge.className = 'cpu-gauge';
      $("#cpu-container").append(gauge);
      createTooltip(gauge, component.Text);
      createCPUGauge(gauge, storageCount, 'Storage', maxTempValue, 0, 0);
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
      let dom = document.getElementById("storage-" + component.id);
      let color = getHsl(maxTempValue);
      let chart = echarts.getInstanceByDom(dom);
      chart.setOption({
        series: [
          {
            itemStyle: {
              color: color,
              shadowColor: getShadowHsl(maxTempValue),
            },
            anchor: {
              itemStyle: {
                borderColor: color
              }
            },
            detail: {
              textBorderColor: getBorderHsl(maxTempValue),
            },
            data: [
              {
                name: getTitle(storageCount, 'Storage'),
                value: maxTempValue,
              },
            ]
          }
        ]
      });
    }
  }
}

var intervalId = null;

function startMonitoring() {
  const dataURL = localStorage.getItem('preference-url') + '/data.json';

  $.ajax({
    type: "GET",
    url: dataURL,
    dataType: "json",
  }).done(function(data) {
    createCPUElement(data);
    createGPUElement(data);
    createMotherboardElement(data);
    createStorageElement(data);
    intervalId = setInterval(function() {
      $.ajax({
        type: "GET",
        url: dataURL,
        dataType: "json",
      }).done(function(data) {
        updateCPUElement(data);
        updateGPUElement(data);
        updateMotherboardElement(data);
        updateStorageElement(data);
      });
    }, 1000);
  }).fail(function(data) {
    $('#preference-url').addClass('is-invalid');
    $('#btn-preferences').trigger('click');
  });
}

function clearMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  $('#cpu-container').empty();
  $('#preference-url').removeClass('is-invalid');
}

function changeColor() {
  const theme = localStorage.getItem('preference-theme') || 'light';
  $('html').attr('data-bs-theme', theme);
  $('.cpu-gauge').each(function() {
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
