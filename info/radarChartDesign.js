// Source - https://stackoverflow.com/a/26319295
// Posted by AAhad
// Retrieved 2026-04-18, License - CC BY-SA 3.0

var RadarChart = {
  draw: function(id, d, options){
  var cfg = {
     radius: 4,
     w: 300,
     h: 300,
     factor: .92,
     factorLegend: 0.8,
     levels: 3,
     maxValue: 0,
     radians: 2 * Math.PI,
     opacityArea: 0.7,
     ToRight: 0,
     TranslateX: 10,
     TranslateY: 10,
     ExtraWidthX: 0,
     ExtraWidthY: 0,
     color: d3.scaleOrdinal(d3.schemeAccent)
    };

    function getColor(seriesData) {
        if (seriesData.label === "0") {
            return "green";
        }
         if (seriesData.label === "1") {
            return "purple";
        }
        return "grey";
    }

    if('undefined' !== typeof options){
      for(var i in options){
        if('undefined' !== typeof options[i]){
          cfg[i] = options[i];
        }
      }
    }
    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    var allAxis = (d[0].map(function(i, j){return i.axis}));
    var total = allAxis.length;
    var cx = cfg.w/ 2;
    var cy = cfg.h / 2;
    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
    var Format = d3.format('.2f');
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
            .append("svg")
            .attr("viewBox", `0 0 ${cfg.w + cfg.ExtraWidthX} ${cfg.h + cfg.ExtraWidthY}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%")
            .append("g")
            .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
            ;

        d3.select(id).selectAll(".radarTooltip").remove();

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "radarTooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", "0");

    //Circular segments
    for(var j=0; j<cfg.levels; j++){
      var levelFactor = radius*((j+1)/cfg.levels);
      g.selectAll(".levels")
       .data(allAxis)
       .enter()
       .append("svg:line")
       .attr("x1", function(d, i){return levelFactor*(1-Math.sin(i*cfg.radians/total));})
       .attr("y1", function(d, i){return levelFactor*(1-Math.cos(i*cfg.radians/total));})
       .attr("x2", function(d, i){return levelFactor*(1-Math.sin((i+1)*cfg.radians/total));})
       .attr("y2", function(d, i){return levelFactor*(1-Math.cos((i+1)*cfg.radians/total));})
       .attr("class", "line")
       .style("stroke", "grey")
       .style("stroke-opacity", "0.75")
       .style("stroke-width", "0.3px")
       .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
    }

    //Text indicating at what % each level is
    for(var j=0; j<cfg.levels; j++){
      var levelFactor = radius*((j+1)/cfg.levels);
      g.selectAll(".levels")
       .data([1]) //dummy data
       .enter()
       .append("svg:text")
       .attr("x", function(d){return levelFactor*(1-Math.sin(0));})
       .attr("y", function(d){return levelFactor*(1-Math.cos(0));})
       .attr("class", "legend")
       .style("font-family", "Helvetica, Arial, sans-serif")
       .style("font-size", "8px")
       .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
       .attr("fill", "#737373")
       .text(Format((j+1)*cfg.maxValue/cfg.levels));
    }

    series = 0;

    var axis = g.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

    axis.append("line")
        .attr("x1", cfg.w/2)
        .attr("y1", cfg.h/2)
        .attr("x2", function(d, i){return cx - radius*Math.sin(i*cfg.radians/total);})
        .attr("y2", function(d, i){return cy-radius*Math.cos(i*cfg.radians/total);})
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

    axis.append("text")
        .attr("class", "legend")
        .text(function(d){return d})
        .style("font-family", "Helvetica, Arial, sans-serif")
        .style("font-size", "9px")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("transform", function(d, i){return "translate(0, -10)"})
        .attr("x", function(d, i){return cx-(radius +10 )*Math.sin(i*cfg.radians/total);})
        .attr("y", function(d, i){return cy-(radius +10 )*Math.cos(i*cfg.radians/total);});


        // dot
    d.forEach(function(y, x){
      dataValues = [];
      g.selectAll(".nodes")
        .data(y, function(j, i){
          var value = Math.max(j.value, 0);
          dataValues.push([
            cx - (value / cfg.maxValue)  *radius*Math.sin(i*cfg.radians/total), 
            cy - (value / cfg.maxValue)* radius  *Math.cos(i*cfg.radians/total)
          ]);
        });
      dataValues.push(dataValues[0]);
      g.selectAll(".area")
                     .data([dataValues])
                     .enter()
                     .append("polygon")
                     .attr("class", "radar-chart-serie"+series)
                     .style("stroke-width", "2px")
                     .style("stroke",getColor(y))
                     .attr("points",function(d) {
                         var str="";
                         for(var pti=0;pti<d.length;pti++){
                             str=str+d[pti][0]+","+d[pti][1]+" ";
                         }
                         return str;
                      })
                     .style("fill", function(j, i){return getColor(y)})
                     .style("fill-opacity", cfg.opacityArea)
                     .on('mouseover', function (event, d){

                                        tooltip.html(getTooltipText(y))
                                              .style("left", (event.pageX + 10) + "px")
                                                .style("top", (event.pageY -20) + "px")
                                                .style("opacity", "1");

                                        const z = "polygon."+d3.select(this).attr("class");
                                        g.selectAll("polygon")
                                         .transition(200)
                                         .style("fill-opacity", 0.1); 
                                        g.selectAll(z)
                                         .transition(200)
                                         .style("fill-opacity", .7);
                                      })
                     .on('mouseout', function(event){
                                        tooltip.style("left", (event.pageX + 10) + "px")
                                                .style("top", (event.pageY -20) + "px")
                                                .style("opacity", "0");
                     });
      series++;
    });
    series=0;

    function getTooltipText(y) {
      let groupName = y.label==="1" ? "Addicted user" : "Non-addicted user";
      return `
        <strong>${groupName}</strong><br>
        Daily Screen Time: ${y[0].value.toFixed(2)} h<br>
        Social media time: ${y[1].value.toFixed(2)} h<br>
        Gaming Time: ${y[2].value.toFixed(2)} h<br>
        Work-Study Time: ${y[3].value.toFixed(2)} h<br>
        Sleeping Time: ${y[4].value.toFixed(2)} h
        `;
    }


    d.forEach(function(y, x){
      g.selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle") 
        .attr("class", "radar-chart-serie"+series)
        .attr('r', cfg.radius)
        .attr("alt", function(j){return Math.max(j.value, 0)})
        .attr("cx", function(j, i){
          dataValues.push([
            cx-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*radius * Math.sin(i*cfg.radians/total), 
            cy-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*radius *Math.cos(i*cfg.radians/total)
        ]);
        return cx-(Math.max(j.value, 0)/cfg.maxValue)*radius *Math.sin(i*cfg.radians/total);
        })
        .attr("cy", function(j, i){
          return cy-(Math.max(j.value, 0)/cfg.maxValue)*radius *Math.cos(i*cfg.radians/total);
        })
        .attr("data-id", function(j){return j.axis})
        .style("fill", getColor(y)).style("fill-opacity", .9)
        .on('mouseover', function (event, d){
                    tooltip.html(getTooltipText(y))
                                              .style("left", (event.pageX + 10) + "px")
                                                .style("top", (event.pageY -20) + "px")
                                                .style("opacity", "1");

                    z = "polygon."+d3.select(this).attr("class");
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", 0.1); 
                    g.selectAll(z)
                        .transition(200)
                        .style("fill-opacity", .7);
                  })
        .on('mousemove', function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY -20) + "px");
        })
        .on('mouseout', function(){

          tooltip.style("opacity", "0");
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", cfg.opacityArea);
                  })

      series++;
    });
  }
};

