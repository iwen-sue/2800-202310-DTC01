// Create the chart
Highcharts.chart('container', {
    chart: {
      type: 'pie'
    },
    title: {
      text: '',
      align: 'left'
    },
    // subtitle: {
    //   text: 'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>',
    //   align: 'left'
    // },
  
    accessibility: {
      announceNewData: {
        enabled: true
      },
      point: {
        valueSuffix: '%'
      }
    },
    tooltip: {
        style: {
            fontSize:"16px",
        }
    },
  
    plotOptions: {
      series: {
        borderRadius: 5,
        dataLabels: {
          enabled: false,
        //   format: '{point.name}: {point.y:.1f}%'
        }
      }
    },
  
    // tooltip: {
    //   headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    //   pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
    // },
  
    series: [
      {
        name: 'expense',
        colorByPoint: true,
        data: [
          {
            name: 'flights',
            y: 8000,
          },
          {
            name: 'hotel',
            y: 12000,
          },
          {
            name: 'food',
            y: 500,
          },
          {
            name: 'tickets',
            y: 200.,
          },
          {
            name: 'Other',
            y: 400,
          }
        ]
      }
    ]
  });