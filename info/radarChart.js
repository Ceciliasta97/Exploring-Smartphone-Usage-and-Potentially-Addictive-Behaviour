// https://d3og.com/jnschrag/34c437ce2a3e5c6e92c8aa5835e5d9d9/example/
// https://stackoverflow.com/questions/24327609/interactive-spider-or-radar-chart-using-d3
// Source - https://stackoverflow.com/a/26319295
// Posted by AAhad
// Retrieved 2026-04-18, License - CC BY-SA 3.0


(function() {
d3.csv("Data.csv").then(function(data) {

    let selectedStressLevel = "All";
    let selectedAddictionLevel = "All";
  

    data.forEach(function(d){
        d["daily_screen_time_hours"] = +d["daily_screen_time_hours"];
        d["social_media_hours"] = +d["social_media_hours"];
        d["gaming_hours"] = +d["gaming_hours"];
        d["work_study_hours"] = +d["work_study_hours"];
        d["sleep_hours"] = +d["sleep_hours"];
        })

    const oneUser = data[0];
    // console.log(oneUser);

    var d = [
        [
            {axis:"daily_screen_time_hours",value:oneUser["daily_screen_time_hours"]},
            {axis:"social_media_hours",value: oneUser["social_media_hours"]},
            {axis:"gaming_hours",value:oneUser["gaming_hours"]},
            {axis:"work_study_hours",value: oneUser["work_study_hours"]},
            {axis:"sleep_hours",value:oneUser["sleep_hours"]},
    ]
];

const radarContainer = document.getElementById("chart_radarchart");
const radarWidth = radarContainer.clientWidth;
const radarHeight = radarContainer.clientHeight;

    //Options for the Radar chart, other than default
    var mycfg = {
        w: Math.max(260, radarWidth ),
        h: Math.max(260, radarHeight),
        maxValue: 10,
        levels: 5,
        ExtraWidthX: 0,
        ExtraWidthY: 0,
        TranslateX: 20,
        TranslateY: 20

    }


function updateChart() {


     // https://stackoverflow.com/questions/68230024/filter-javascript-array-based-on-multiple-values
    var filteredData = data.filter(function(d) {
      return  (selectedStressLevel === "All" ||d["stress_level"] === selectedStressLevel) &&
              (selectedAddictionLevel === "All" ||d["addiction_level"] === selectedAddictionLevel);
        

});

    var addicted_label_0_group = filteredData.filter(function(d) {
      return d["addicted_label"] === "0";
});

    var addicted_label_1_group = filteredData.filter(function(d) {
      return d["addicted_label"] === "1";
});

    console.log(filteredData.length);
    console.log(addicted_label_0_group.length);
    console.log(addicted_label_1_group.length);

    var radarGraphs = [];

    // check if the data is null
    if (addicted_label_0_group.length > 0)  {

        const averageScreenTime0 = d3.mean(addicted_label_0_group, function(d) {
            return d["daily_screen_time_hours"];
        });

        const averageSocialMediaTime0 = d3.mean(addicted_label_0_group, function(d) {
            return d["social_media_hours"];
        });

        const averageGamingTime0 = d3.mean(addicted_label_0_group, function(d) {
            return d["gaming_hours"];
        });

        const averageWorkStudyTime0 = d3.mean(addicted_label_0_group, function(d) {
            return d["work_study_hours"];
        });

        const averageSleepTime0 = d3.mean(addicted_label_0_group, function(d) {
            return d["sleep_hours"];
        });


         var radarFilter0 = [
        
            {axis:"daily_screen_time_hours",value: averageScreenTime0},
            {axis:"social_media_hours",value: averageSocialMediaTime0},
            {axis:"gaming_hours",value: averageGamingTime0},
            {axis:"work_study_hours",value: averageWorkStudyTime0},
            {axis:"sleep_hours",value:averageSleepTime0},

         ];
         radarFilter0.label = "0"

        console.log("radarFilter0:", radarFilter0);
        console.log("radarFilter0 length:", radarFilter0.length);
         radarGraphs.push(radarFilter0)
    }

     if (addicted_label_1_group.length > 0)  {

        const averageScreenTime1 = d3.mean(addicted_label_1_group, function(d) {
            return d["daily_screen_time_hours"];
        });

        const averageSocialMediaTime1 = d3.mean(addicted_label_1_group, function(d) {
            return d["social_media_hours"];
        });

        const averageGamingTime1 = d3.mean(addicted_label_1_group, function(d) {
            return d["gaming_hours"];
        });

        const averageWorkStudyTime1 = d3.mean(addicted_label_1_group, function(d) {
            return d["work_study_hours"];
        });

        const averageSleepTime1 = d3.mean(addicted_label_1_group, function(d) {
            return d["sleep_hours"];
        });


        var radarFilter1 = [
        
            {axis:"daily_screen_time_hours",value: averageScreenTime1},
            {axis:"social_media_hours",value: averageSocialMediaTime1},
            {axis:"gaming_hours",value: averageGamingTime1},
            {axis:"work_study_hours",value: averageWorkStudyTime1},
            {axis:"sleep_hours",value:averageSleepTime1},

        ];
        radarFilter1.label = "1"
        console.log("radarFilter1:", radarFilter1);
        console.log("radarFilter1 length:", radarFilter1.length);
        radarGraphs.push(radarFilter1)
    }

    if (radarGraphs.length === 0) {
        console.log(" not data for this options");
        d3.select("#chart_radarchart").select("svg").remove();

    }

    console.log("radar graph length:" + radarGraphs.length);
    console.log("radar graph:" + radarGraphs);

    RadarChart.draw("#chart_radarchart", radarGraphs, mycfg);

        if (radarGraphs.length === 1) {
        console.log(" only one group has data");
    }

    }


    // https://stackoverflow.com/questions/61828573/replace-d3-select-and-onchange-function-with-jquery
    updateChart();
    // When the button is changed, run the updateChart function
    d3.select("#stress_level").on("change", function() {
                selectedStressLevel = d3.select(this).property("value");
                console.log("selectedStressLevel:", selectedStressLevel);
                updateChart();

    });


     d3.select("#addiction_level").on("change", function() {
                selectedAddictionLevel = d3.select(this).property("value");
                console.log("selectedAddictionLevel:", selectedAddictionLevel);
                updateChart();

    });

});
})();

