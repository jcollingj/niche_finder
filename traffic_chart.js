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
  const data_string = '2022-05-26++1235|2022-06-09++1227|2022-06-23++1330|2022-07-09++1269|2022-07-23++1507|2022-08-06++1598|2022-08-20++1939|2022-09-03++1727|2022-09-17++2048|2022-10-01++2763|2022-10-15++2948|2022-10-30++4433|2022-11-13++4301|2022-11-28++4887|2022-12-13++4739|2022-12-28++4347|2023-01-12++4660|2023-01-27++5130|2023-02-11++7604|2023-02-26++7701|2023-03-13++7495|2023-03-28++7168|2023-04-12++6965|2023-04-27++5187|2023-05-12++5551'
  const {dates, values} = splitStringToLists(data_string)
  const ctx = document.getElementById('myChart').getContext('2d');
  Chart.defaults.font.family = "'Poppins', 'sans-serif'";
  // Chart.defaults.scales.color = 'red';

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Estimated Organic Traffic',
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
