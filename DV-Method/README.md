# Scatter Plot
*(scatterplot, scatter graph, scatter chart, scattergram, or scatter diagram)*  
*"The workhorse of data visualization in social science"* - Kieran Healy

## Description / Use
A scatter plot is a visualization method designed to show the correlation (which can be positive, negative or null) between two variables. This is achieved by plotting the two points on a horizontal (X) and veretical (Y) axis using a [cartesian coordinate system](https://en.wikipedia.org/wiki/Cartesian_coordinate_system). Additional variables can be included through the adaptation of color, shape and size.

## History
- Cartesian coordinate system developed by René Descartes in the 17th century.
- First example made in 1833 by the English scientist John Frederick W. Herschel.
- Estimated to be used in over 70% of scientific experiements.
- Show to be the chart wich people perceive most accurately and quickly. ([source](https://priceonomics.com/how-william-cleveland-turned-data-visualization/)).

### Further Reading
The early origins and development of the scatterplot by [Friendly & Denis](http://datavis.ca/papers/friendly-scat.pdf)


## Gathering / Plotting Data
Either
- One control parameter (independent variable) and one dependent variable (correlation and causation).
  - If a parameter exists that is systematically incremented and/or decremented by the other, it is called the control parameter.
  - Dependent variables depend on the values of independent variables.
  - Dependent variable will usually be plotted along the vertical axis. 
  
Or   
- Two independent variables (correlation, not causation).
  - Either variable can be plotted on either axis.

Both
-  A line of best fit (trendline) can be drawn in order to study the relationship between the variables.

## Examples
### Basic
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/basic-scatter-plot-in-r.png)
Example created in R ([code](https://www.sharpsightlabs.com/blog/scatter-plot-in-r/)). This example is missing axis labels and a title.

### Inclusion of Color
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/python-color-scatterplot.jpg)
Example created in Python with Matplotlib ([code](https://towardsdatascience.com/customizing-plots-with-python-matplotlib-bcf02691931f)). This example also uses transparency to more easily show multiple clustered data points.

### Use of Shapes
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/ggplot-shapes-scatterplot.png)  
Examples created in R with ggplot ([code](https://www.datanovia.com/en/lessons/ggplot-scatter-plot/)). 
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/NYT-shapes-scatterplot.png)
Example from the [New York Times](https://www.nytimes.com/2017/10/09/learning/whats-going-on-in-this-graph-oct-10-2017.html) (no code sorry!) which uses color images to easily ideitify the different data points.

### Third Axis (Scatter Plot Matrix)
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/matlab-3d-scatterplot.png)
Example created in MATLAB displaying 4 variables ([code](https://www.mathworks.com/help/matlabmobile/ug/creating-3d-scatter-plot.html)).

### Use of Interactivitiy
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/Hannah-Davids-Interactive.png)
Interactive design by [Hannah Davis](http://www.hannahishere.com/) about [Holywood Movies](http://www.hannahishere.com/hollywood/). Design created in 2011 using [Processing.js](http://processingjs.org).

### Bubble Charts
Bubble Chart have been covered as a seaprate visualization type, but the [Gapminder](https://www.gapminder.org/tools/) example by [Hans Rosling](https://en.wikipedia.org/wiki/Hans_Rosling) is a brilliant interarative example that demonstrates the power of scatterplots / bubble charts, but also to demonstrate that **correlation does not always equal causation**.
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/dv_method/Images/gapminder.gif)
If you havent seen it before, definitely watch [Let my dataset change your mindset](https://www.ted.com/talks/hans_rosling_at_state).

#### Differences from Bubble Chart
While many bubble charts use a scatter plot format with the addition of changing the size of the plot points to indicate an additional variable, not all bubble charts need to be constrained by the X/Y axis format of a scatter plot. 

## Code Examples
### P5
[Example from the P5 documentation](https://editor.p5js.org/allison.parrish/sketches/ry9wlx46b)
Well commented and easy to follow [P5 code](https://github.com/workergnome/dataviz-workshop/blob/master/scatterplot-p5/sketch.js) using the ```noLoop()``` approach and including color from the [Datavis Workshop](https://github.com/workergnome/dataviz-workshop). The workshop is using the [Carnegie Museum of Art](http://www.cmoa.org) collection API.
### D3
The [D3 Graph Gallery](https://www.d3-graph-gallery.com/index.html) give a short [D3 code](https://www.d3-graph-gallery.com/graph/scatter_basic.html) example which is commented and easy to follow.
The [Datavis Workshop](https://github.com/workergnome/dataviz-workshop) as includes a [D3 example](https://github.com/workergnome/dataviz-workshop/tree/master/scatterplot-d3).

