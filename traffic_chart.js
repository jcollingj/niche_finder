  function splitStringToLists(str) {
    const dates = [];
    const values = [];
    const month_averages = {}
    const items = str.split('|');
    for (let i = 0; i < items.length; i++) {
      const [date, value] = items[i].split('++');
      // Convert date to a Date object
      const [year, month, day] = date.split('-');
      const year_month_string = `${year}-${month}`;
      if (!(year_month_string in month_averages)) {
        month_averages[year_month_string] = {
          values: [value],
          count: 1,
        }
      } else if (year_month_string in month_averages) {
        month_averages[year_month_string].values.push(value);
        month_averages[year_month_string].count += 1;
      }
    }

    const keys = Object.keys(month_averages);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      dates.push(key);
      let average = month_averages[key].values.reduce((a, b) => parseInt(a) + parseInt(b), 0) / month_averages[key].count;
      average = Math.round(average);
      values.push(average);
      month_averages[key].average = average;
    }
    return {dates, values};
  }
  function create_traffic_graph(data_string) {
    const {dates, values} = splitStringToLists(data_string)
  const ctx = document.getElementById('myChart').getContext('2d');
  Chart.defaults.font.family = "'Poppins', 'sans-serif'";
  // Chart.defaults.scales.color = 'red';

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: '',
        data: values,
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        borderColor: '#24DDED',
        borderWidth: 2,
        tension: 0.3

      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM \'YY'
            },
            tooltipFormat: 'MMM YYYY',
            parser: 'YYYY-MM'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date',
          },
          border: {
            color: '#130F40',
            width: 2,
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            callback: function (val, index) {
              return '   ' + this.getLabelForValue(val);
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 0,
          },
          tooltip: {
            mode: 'nearest',
            enabled: true,
            intersect: false,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return context.parsed.y;
              }
            }
          }
        },
      }
    }
  }); 
  }
