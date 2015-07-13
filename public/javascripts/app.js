var app = angular.module('timeSeries', []);

app.controller('AppController', function($scope, $http, Context, GraphService){

  //defaults
  $scope.timeSeries = 1;
  $scope.types = "a";
  $scope.granularity = "year";
  $scope.fold = "month";
  $scope.mapping = 5;
  $scope.search = ["Portugal"];
  var clear;

  updateServer();

  $scope.dataSet = function () {
    Context.serie = $scope.timeSeries;
    updateServer();
  }

  $scope.dataType = function () {
    Context.types = $scope.types;
    updateServer();
  }

  $scope.dataGranularity = function () {
    Context.granularity = $scope.granularity;
    updateServer();
  }

  $scope.dataFold = function () {
    Context.fold = $scope.fold;
    updateServer();
  }

  $scope.dataMapping = function () {
    Context.mapping = $scope.mapping;
    updateServer();
  }

  $scope.searchLocation = function () {
    Context.search = $scope.search;
    updateServer();
  }

  $scope.locations = [
    "Portugal",
    "Aveiro",
    "Beja",
    "Braga",
    "Bragança",
    "Castelo Branco",
    "Coimbra",
    "Évora",
    "Faro",
    "Guarda",
    "Leiria",
    "Lisboa",
    "Portalegre",
    "Porto",
    "Santarém",
    "Setúbal",
    "Viana do Castelo",
    "Vila Real",
    "Viseu"
  ];

  function updateServer () {
    GraphService.Clear();
    $scope.search.forEach(function(local) {
        var getParams = {
        timeSeries:$scope.timeSeries,
        types:$scope.types,
        region:local
      };
      $http({method: 'GET',
                url: '/dataset',
            params: getParams}).
      success(function(data, status, headers, config) {
        $scope.data = data.data;
        GraphService.Graph(data,local,$scope.granularity,$scope.fold,$scope.mapping);
      }).
      error(function(data, status, headers, config) {
        console.log(data+"\n"+status+"\n"+header+"\n"+config);
      });
    });
  }
});

app.factory('Context', function() {
  return {
    serie: "timeseriesurop",
    types: "a",
    granularity: "month",
    fold: "day",
    mapping: 5,
    search: ["Portugal"]
  }
});

app.factory('GraphService', function() {
  return {
    Graph: function(data, id, granularity, fold, mapping) {
      if(data.rowCount !== 0){
        console.log(data);
        var newGraphDiv = document.createElement('div');
        var local = document.createTextNode(id);
        newGraphDiv.id = id;
        var docDiv = document.getElementById('cal-heatmap');
        docDiv.appendChild(newGraphDiv);
        var colLimitAux,
            cellSizeAux,
            legendAux=[],
            step = Math.abs(Math.floor((data.maxVal-data.minVal)/mapping-1)),
            maxDate = new Date(data.maxDate*1000);
            minDate = new Date(data.minDate*1000);
            nYears = maxDate.getFullYear()-minDate.getFullYear();

        for(var i=0; i<mapping; i++){
          legendAux[i]=i*step;
        }

        if(granularity === "hour"){
          rangeAux = nYears*366*24;
          colLimitAux = 24;
        }
        else if(granularity === "day"){
            rangeAux = nYears*366;
            colLimitAux = 24;
        }
        else if(granularity === "week"){
          rangeAux = nYears*52;
          if(fold === "hour"){
            colLimitAux = 168;
          }
          else if(fold === "day"){
            colLimitAux = 7;
          }
        }
        else if(granularity === "month"){
          rangeAux = nYears*12;
          if(fold === "hour"){
            colLimitAux = 744;
          }
          else if(fold === "day"){
            colLimitAux = 31;
          }
          else if(fold === "week"){
            colLimitAux = 0;
          }
        }
        else if(granularity === "year"){
          rangeAux = nYears;
          if(fold === "hour"){
            colLimitAux = 8760;
          }
          else if(fold === "day"){
            colLimitAux = 366;
          }
          else if(fold === "week"){
            colLimitAux = 0;
          }
          else if(fold === "month"){
            colLimitAux = 31;
          }
        }

        cellSizeAux = 100/rangeAux;

        if(clear === 1){
          clear = 0;
          var cal = new CalHeatMap();
          cal.init({
            itemSelector: document.getElementById(id),
            legendVerticalPosition: "top",
            animationDuration: 0,
            verticalOrientation: true,
            cellSize: cellSizeAux,
            domainGutter: 0,
            colLimit: colLimitAux,
            start: new Date(data.minDate*1000),
            data: data.data,
            domainLabelFormat: "",
            domainMargin: 0,
            cellPadding: 0,
            domain: granularity,
            subDomain: fold,
            range: rangeAux,
            legend: legendAux
          });
        }
        else{
          var cal = new CalHeatMap();
          cal.init({
            itemSelector: document.getElementById(id),
            displayLegend: false,
            verticalOrientation: true,
            cellSize: cellSizeAux,
            domainGutter: 0,
            colLimit: colLimitAux,
            start: minDate,
            data: data.data,
            domainLabelFormat: "",
            domainMargin: 0,
            cellPadding: 0,
            domain: granularity,
            subDomain: fold,
            range: rangeAux,
            legend: legendAux
          });
        }
        docDiv.appendChild(local);
      }
      else {
        var newGraphDiv = document.createElement('div');
        var local = document.createTextNode("There is no data for "+id+".");
        newGraphDiv.id = id;
        var docDiv = document.getElementById('cal-heatmap');
        docDiv.appendChild(newGraphDiv);
        docDiv.appendChild(local);
      }
    },
    Clear: function() {
      var removeGraphs = document.getElementById('cal-heatmap');
      while (removeGraphs.firstChild) {
        removeGraphs.removeChild(removeGraphs.firstChild);
      }
      clear = 1;
    }
  };
})
