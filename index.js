function tempToHslHue(value) {
  // ~ 10°C => 240 deg(HSL blue)
  // 10°C ~ 90°C => 240 deg(HSL blue) ~ 0 deg(HSL red)
  // 90°C ~ => 0 deg(HSL red)
  value = Math.max(Math.min(value, 90), 10) - 10;
  return 240 - 240 * (value / 80);
}

function getTempColor(value) {
  if (Number.isNaN(value)) {
    return getAxisLineColor();
  }
  return 'hsl(' + tempToHslHue(value) + ',85%,50%)';
}

function getTempTextBorderColor(value) {
  if (Number.isNaN(value)) {
    // TODO: Slightly darker color
    return getAxisLineColor();
  }
  return 'hsl(' + tempToHslHue(value) + ',85%,40%)';
}

function getTempShadowColor(value) {
  if (Number.isNaN(value)) {
    return getAxisLineColor();
  }
  return 'hsl(' + tempToHslHue(value) + ',85%,50%)';
}

function getAxisLineColor() {
  return localStorage.getItem('preference-theme') == 'dark' ? '#43484d' : '#e6ebf8';
}

function getTempShadowBlur(value) {
  if (localStorage.getItem('preference-gauge') == 'normal') {
    return 3;
  }
  value = Math.max(Math.min(value, 90), 30) - 30;
  return 3 + 27 * (value / 70);
}

function getGaugeTitle(count, text) {
  const match = text.match(/^CPU Core #([0-9]+)$/);
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
  if (text == 'GPU N/A') {
    return '{value|\uF6E2}\n{n|#' + count + '}';
  }
  if (text == 'Motherboard') {
    return '{value|\uF6E7}\n{n|Max}'
  }
  if (text == 'Motherboard N/A') {
    return '{value|\uF6E7}\n{n|}'
  }
  if (text == 'Storage') {
    return '{value|\uF412}\n{n|#' + count + ' Max}'
  }
  if (text == 'Storage N/A') {
    return '{value|\uF412}\n{n|#' + count + '}'
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
  const chart = echarts.init(element, null, {
    renderer: 'svg' // For beautiful zooming
  });
  const animationDuration = 900; // TODO: Change this value as the interval value is changed.
  const option = {
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
          color: getTempColor(tempValue),
          shadowBlur: getTempShadowBlur(tempValue),
          shadowColor: getTempShadowColor(tempValue),
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
          offsetCenter: [Number.isNaN(tempValue) ? 0 : 6, '50%'],
          color: 'inherit',
          textBorderWidth: 1,
          textBorderColor: getTempTextBorderColor(tempValue),
          formatter: function(value) {
            if (Number.isNaN(value)) {
              return '{value|N/A}';
            }
            return '{value|' + value.toFixed(0) + '}{unit|°C}';
          },
          rich: {
            value: {
              fontSize: Number.isNaN(tempValue) ? 24 : 36,
              fontWeight: 'bolder',
            },
            unit: {
              fontSize: 12,
              fontWeight: 'bolder',
              padding: [0, 0, -19, 2]
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
    ]
  };

  if (!Number.isNaN(load1Value)) {
    option.series.push(
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
          roundCap: true,
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
      }
    );
  }
  if (!Number.isNaN(load2Value)) {
    option.series.push(
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
          roundCap: true,
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
      }
    );
  }
  chart.setOption(option);
}

function updateGauge(element, count, label, tempValue, load1Value, load2Value) {
  const color = getTempColor(tempValue);
  const chart = echarts.getInstanceByDom(element);
  const option = {
    series: [
      {
        itemStyle: {
          color: color,
          shadowBlur: getTempShadowBlur(tempValue),
          shadowColor: getTempShadowColor(tempValue),
        },
        anchor: {
          itemStyle: {
            borderColor: color
          }
        },
        detail: {
          textBorderColor: getTempTextBorderColor(tempValue),
        },
        data: [
          {
            name: getGaugeTitle(count, label),
            value: tempValue,
          },
        ]
      }
    ]
  };
  if (!Number.isNaN(load1Value)) {
    option.series.push(
      {
        data: [
          {
            value: load1Value
          }
        ]
      }
    );
  }
  if (!Number.isNaN(load2Value)) {
    option.series.push(
      {
        data: [
          {
            value: load2Value
          }
        ]
      }
    );
  }
  chart.setOption(option);
}

function createGaugeElement(id, count, label, tempValue, load1Value, load2Value, tooltip) {
  const gauge = document.createElement('div');
  gauge.id = id;
  gauge.className = 'gauge';
  $("#gauge-container").append(gauge);
  createTooltip(gauge, tooltip);
  createGauge(gauge, count, label, tempValue, load1Value, load2Value);
}

function updateGaugeElement(id, count, label, tempValue, load1Value, load2Value) {
  const gauge = document.getElementById(id);
  updateGauge(gauge, count, label, tempValue, load1Value, load2Value);
}

function getCPULoadMap(component) {
  const loadMap = {};
  for (let prop of component.Children) {
    if (!prop.ImageURL.endsWith('/load.png')) {
      continue;
    }
    for (let load of prop.Children) {
      const match = load.Text.match(/^(CPU Core #[0-9]+)(| Thread #([0-9]+))$/);
      if (!match) {
        continue;
      }
      const cpuCoreText = match[1];
      const loadValue = Number(load.Value.split(" ")[0]);
      if (!loadMap[cpuCoreText]) {
        loadMap[cpuCoreText] = [Number.NaN, Number.NaN];
      }
      const thread = match[3] ? parseInt(match[3]-1) : 0;
      loadMap[cpuCoreText][thread] = loadValue;
    }
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
    const loadMap = getCPULoadMap(component);
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        createGaugeElement('cpu-' + temp.id, cpuCount, temp.Text, tempValue,
          loadMap[temp.Text][0], loadMap[temp.Text][1], component.Text);
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
    const loadMap = getCPULoadMap(component);
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^CPU Core #[0-9]+$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        updateGaugeElement('cpu-' + temp.id, cpuCount, temp.Text, tempValue,
          loadMap[temp.Text][0], loadMap[temp.Text][1]);
      }
    }
  }
}

function getGPULoad(component) {
  for (let prop of component.Children) {
    if (!prop.ImageURL.endsWith('/load.png')) {
      continue;
    }
    for (let load of prop.Children) {
      if (!load.Text.match(/^GPU Core$/)) {
        continue;
      }
      // Prioritize GPU Core
      return Number(load.Value.split(" ")[0]);
    }
    for (let load of prop.Children) {
      if (!load.Text.match(/^D3D 3D$/)) {
        continue;
      }
      // Return D3D 3D Load if there is no GPU Core (somehow...)
      return Number(load.Value.split(" ")[0]);
    }
  }
  return 0;
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
    const gpuCoreLoadValue = getGPULoad(component);
    let tempCount = 0;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        const load1Value = temp.Text == 'GPU Core' ? gpuCoreLoadValue : Number.NaN;
        createGaugeElement('gpu-' + temp.id, gpuCount, temp.Text, tempValue,
          load1Value, Number.NaN, component.Text);
        tempCount++;
      }
    }
    if (tempCount == 0) {
      createGaugeElement('gpu-' + component.id, gpuCount, 'GPU N/A', Number.NaN,
        gpuCoreLoadValue, Number.NaN, component.Text);
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
    const gpuCoreLoadValue = getGPULoad(component);
    let tempCount = 0;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^GPU (Core|Hot Spot)$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        const load1Value = temp.Text == 'GPU Core' ? gpuCoreLoadValue : Number.NaN;
        updateGaugeElement('gpu-' + temp.id, gpuCount, temp.Text, tempValue,
          load1Value, Number.NaN);
        tempCount++;
      }
    }
    if (tempCount == 0) {
      updateGaugeElement('gpu-' + component.id, gpuCount, 'GPU N/A', Number.NaN,
        gpuCoreLoadValue, Number.NaN);
    }
  }
}

function createMotherboardElement(data) {
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/mainboard.png')) {
      continue;
    }
    const chip = component.Children[0];
    if (!chip || !chip.ImageURL.endsWith('/chip.png')) {
      // Chipset not found.
      createGaugeElement('motherboard', 1, 'Motherboard N/A', Number.NaN,
        Number.NaN, Number.NaN, component.Text);
      continue;
    }
    let tempCount = 0;
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
      createGaugeElement('motherboard', 1, 'Motherboard', maxTempValue,
        Number.NaN, Number.NaN, component.Text);
      tempCount++;
    }
    if (tempCount == 0) {
      // Chipset found, but no temperature data.
      createGaugeElement('motherboard', 1, 'Motherboard N/A', Number.NaN,
        Number.NaN, Number.NaN, component.Text);
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
    if (!chip || !chip.ImageURL.endsWith('/chip.png')) {
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
      updateGaugeElement('motherboard', 1, 'Motherboard', maxTempValue,
        Number.NaN, Number.NaN);
    }
    break;
  }
}

function getStorageLoad(component) {
  for (let prop of component.Children) {
    if (!prop.ImageURL.endsWith('/load.png')) {
      continue;
    }
    for (let load of prop.Children) {
      if (!load.Text.match(/^Total Activity$/)) {
        // Only Total Activity supported
        continue;
      }
      return Number(load.Value.split(" ")[0]);
    }
  }
  return 0;
}

function createStorageElement(data) {
  let storageCount = 0;
  for (let component of data.Children[0].Children) {
    if (!component.ImageURL.endsWith('/hdd.png')) {
      continue;
    }
    storageCount++;
    const load1Value = getStorageLoad(component);
    let tempCount = 0;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }
      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature(| [0-9]+)$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      createGaugeElement('storage-' + component.id, storageCount, 'Storage', maxTempValue,
        load1Value, Number.NaN, component.Text);
      tempCount++;
    }
    if (tempCount == 0) {
      createGaugeElement('storage-' + component.id, storageCount, 'Storage N/A', Number.NaN,
        load1Value, Number.NaN, component.Text);
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
    const load1Value = getStorageLoad(component);
    let tempCount = 0;
    for (let prop of component.Children) {
      if (!prop.ImageURL.endsWith('/temperature.png')) {
        continue;
      }

      let maxTempValue = 0;
      for (let temp of prop.Children) {
        if (!temp.Text.match(/^Temperature(| [0-9]+)$/)) {
          continue;
        }
        const tempValue = Number(temp.Value.split(" ")[0]);
        maxTempValue = Math.max(maxTempValue, tempValue);
      }
      updateGaugeElement('storage-' + component.id, storageCount, 'Storage', maxTempValue,
        load1Value, Number.NaN);
      tempCount++;
    }
    if (tempCount == 0) {
      updateGaugeElement('storage-' + component.id, storageCount, 'Storage N/A', Number.NaN,
        load1Value, Number.NaN);
    }
  }
}

var pollingIntervalId = null;

function startMonitoring() {
  const dataURL = localStorage.getItem('preference-url') + '/data.json';

  $('#spinner-body-container').show();
  $('#btn-preferences').prop('disabled', true);
  $.ajax({
    type: "GET",
    url: dataURL,
    dataType: "json",
  }).done(function(data) {
    $('#spinner-body-container').hide();
    $('#btn-preferences').prop('disabled', false);

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
    $('#btn-preferences').prop('disabled', false);

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
  const theme = localStorage.getItem('preference-theme');
  $('html').attr('data-bs-theme', theme);
  $('.gauge').each(function() {
    const chart = echarts.getInstanceByDom(this);
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
  let theme = localStorage.getItem('preference-theme');
  if (!theme) {
    theme = 'light';
    localStorage.setItem('preference-theme', theme);
  }
  $('#preference-theme').attr('checked', theme == 'dark');
  changeColor();
}

function initializeGaugeMode() {
  let gauge = localStorage.getItem('preference-gauge');
  if (!gauge) {
    gauge = 'normal';
    localStorage.setItem('preference-gauge', gauge);
  }
  $('#preference-gauge').attr('checked', gauge == 'fancy');
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

function changeGaugeMode(checked) {
  localStorage.setItem('preference-gauge', checked ? 'fancy' : 'normal');
}

document.getElementById('modal-preferences').addEventListener('hidden.bs.modal', (event) => {
  const serverURL = ($('#preference-url').val() || '').trim();
  localStorage.setItem('preference-url', serverURL);

  clearMonitoring();
  startMonitoring();
});

$(document).ready(function() {
  initializeColorMode();
  initializeGaugeMode();
  initializeWebServerURL();

  startMonitoring();
});
