let finalData = [];

function generateChart(data, selected, height = 500, width = 800, margin = 45) {
  // Creo un svg dentro del div seleccionado
  document.getElementById("chart").innerHTML = "";
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin * 2)
    .attr("height", height + margin * 2)
    .append("g")
    .attr("transform", `translate(${margin + 10},${margin})`);

  let x = d3.scaleLinear().domain([0, 5]).range([0, width]);
  let y = d3
    .scaleBand()
    .range([0, height])
    .domain(data.map((d) => d.country))
    .padding(0.1);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text");

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.country))
    .attr("width", (d) => x(d.value))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => {
      return d.country == selected ? "#990000" : "#0000ff";
    });
}
function getData() {
  return d3.csv("./Data/data.csv").then((rawData) => {
    const data = [];

    rawData
      .filter((element) => element.winner)
      .forEach((element) => {
        if (
          data.some((elementData) => elementData.country === element.winner)
        ) {
          //como ya se que el elemento esta en el array data lo que hago es buscar su posción
          const index = data.findIndex(
            (elementData) => elementData.country === element.winner
          );
          // y ahora que se su posicion le incremento el valor de las veces que ha ganado.
          data[index].value++;
        } else {
          data.push({ country: element.winner, value: 1 });
        }
      });
    return { data: data, rawData: rawData };
  });
}
function main() {
  getData().then((result) => {
    finalData = result;
    generateChart(finalData.data);
    generateSlider(finalData);
  });
}

function generateSlider(allData) {
  const width = 800;

  years = allData.rawData.map((d) => d.year);

  const x2 = d3.scaleLinear().range([0, 500]);
  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(years)) // rango años
    .max(d3.max(years))
    .step(4) // cada cuánto aumenta el slider
    .width(580) // ancho de nuestro slider
    .ticks(years.length)
    .default(years[years.length - 1])
    .on("onchange", (year) => {
      d3.select("p#value-time").text(year);
      const winner = allData.rawData.find((element) => element.year == year);
      generateChart(allData.data, winner.winner);
    });

  var gTime = d3
    .select("div#slider-time") // div donde lo insertamos
    .append("svg")
    .attr("width", width * 0.8)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gTime.call(sliderTime);

  d3.select("p#value-time").text(d3.timeFormat("%Y")(sliderTime.value()));
}

main();
