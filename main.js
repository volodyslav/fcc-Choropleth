import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const container = document.querySelector("#container")
const EducationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
const CountyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"


async function getData(){
    try{
        const education = await fetch(EducationURL)
        const country = await fetch(CountyURL)
        const educationData = await education.json()
        const countryData = await country.json()
        drawData(educationData, countryData)
    }catch(e){
        console.log(e)
    }
}

getData()

function drawData(education, county){
    const width = 1000
    const height = 800

    const findCounty = (id) => education.find((d) => d.fips === id);

    const svg = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height);
    
    const counties = svg.append("g")
                        .attr("id", "counties")

    const colorScale = d3.scaleSequential(d3.interpolateGreens) 
                        .domain([0, d3.max(education.map(d => d.bachelorsOrHigher))]);

    const legendColorScale = d3.scaleSequential()
                    .domain([0, 100]) 
                    .interpolator(d3.interpolateGreens);

    const legendData = d3.scaleLinear()
                    .domain([d3.min(education.map(d => d.bachelorsOrHigher)), d3.max(education.map(d => d.bachelorsOrHigher))])
                    .ticks(6);

    const legend = svg.append("g")
                    .attr("id", "legend")
                    .attr("transform", "translate(500,20)");

    legend.selectAll('rect')
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 50)
        .attr("y", 0)
        .attr("width", 50)
        .attr("height", 20)
        .attr("fill", d => legendColorScale(d));

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 50 + 10)
        .attr("y", 40)
        .text(d => `${d}%`);

    const tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .attr("id", "tooltip")
                    .style("background-color", "rgba(34, 34, 34, 0.5)")
                    .style("color", "white")
                    .style("padding", "1rem")
                    .style("border-radius", "10px")
                    .style("pointer-events", "none")
                    .style("opacity", 0)

    counties.selectAll("path")
            .data(topojson.feature(county, county.objects.counties).features)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("data-fips", d => d.id)
            .attr("data-education", d => findCounty(d.id).bachelorsOrHigher)
            .attr("d", d3.geoPath())
            .attr("fill", d => colorScale(findCounty(d.id).bachelorsOrHigher))

    svg.selectAll(".county")
            .on("mouseenter", (e, d) => {
                tooltip
                .style("opacity", 1)
                .html(`${findCounty(d.id).area_name}, ${findCounty(d.id).state}:  ${findCounty(d.id).bachelorsOrHigher}% `)
                .style("left", (e.pageX + 20) + "px")
                .style("top", (e.pageY + 20) + "px")
                .attr("data-education", findCounty(d.id).bachelorsOrHigher)
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0)
            })
    
    container.appendChild(svg.node())
}