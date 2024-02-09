var canvas_bottom = document.getElementById("canvas_bottom");
var ctx_bottom = canvas_bottom.getContext("2d");
var canvas_top = document.getElementById("canvas_top");
var ctx_top = canvas_top.getContext("2d");
var cur_tool = "pen";
var cursor = "pen_icon";
var pos_x = 0, pos_y = 0;
var painting = false;
var color = "black";
var line_width = 5;
var font_size = 14;
var canvas_rect = canvas_bottom.getBoundingClientRect();

canvas_bottom.width = window.innerWidth * 0.75;
canvas_bottom.height = window.innerHeight * 0.8;
canvas_top.width = window.innerWidth * 0.75;
canvas_top.height = window.innerHeight * 0.8;

ctx_bottom.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
ctx_bottom.fillStyle = "white";
ctx_bottom.fillRect(0, 0, canvas_bottom.width, canvas_bottom.height);

// <palette>
const palette_container = document.querySelector('#palette');
const palette_canvas = document.createElement('canvas');
const palette_circle = document.createElement('div');
const palette_txt = document.createElement('div');
palette_canvas.width = window.innerWidth * 0.2;
palette_canvas.height = window.innerHeight * 0.2;
palette_container.appendChild(palette_canvas);
palette_container.appendChild(palette_circle);
palette_container.appendChild(palette_txt);

palette_container.style.position = 'relative';
palette_txt.style.cssText = `font-size: 0.9em; text-align: center;`;
palette_circle.style.cssText = `border: 2px solid; border-radius: 50%; width: 12px; height: 12px; position: absolute; pointer-events: none; box-sizing: border-box;`;

palette_txt.innerText = "rgb(0,0,0) #000000";
palette_txt.style.backgroundColor = "#000000";
palette_txt.style.color = "#FFF";
const [palette_width, palette_height] = [palette_container.offsetWidth, palette_container.offsetHeight];
[palette_canvas.width, palette_canvas.height] = [palette_width, palette_height];

drawColors(palette_canvas);
palette_canvas.addEventListener("click", (e) => pickColor(e, palette_canvas, palette_circle, palette_txt));

function drawColors() {
    const context = palette_canvas.getContext('2d');
    const { width, height } = palette_canvas;

    //Colors - horizontal gradient
    const gradientH = context.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, 'rgb(255, 0, 0)'); // red
    gradientH.addColorStop(1 / 6, 'rgb(255, 255, 0)'); // yellow
    gradientH.addColorStop(2 / 6, 'rgb(0, 255, 0)'); // green
    gradientH.addColorStop(3 / 6, 'rgb(0, 255, 255)');
    gradientH.addColorStop(4 / 6, 'rgb(0, 0, 255)'); // blue
    gradientH.addColorStop(5 / 6, 'rgb(255, 0, 255)');
    gradientH.addColorStop(1, 'rgb(255, 0, 0)'); // red
    context.fillStyle = gradientH;
    context.fillRect(0, 0, width, height);

    //Shades - vertical gradient
    const gradientV = context.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradientV.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradientV.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');
    context.fillStyle = gradientV;
    context.fillRect(0, 0, width, height);
}

function pickColor(event, canvas, circle, txt) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left; //x position within the element.
    const y = event.clientY - rect.top; //y position within the element.
  
    const context = canvas.getContext('2d');
    const imgData = context.getImageData(x, y, 1, 1);
    const [r, g, b] = imgData.data;
    const [h, s, l] = rgb2hsl(r, g, b);
    const txtColor = l < 0.5 ? '#FFF' : '#000';
    circle.style.top = y - 6 + 'px';
    circle.style.left = x - 6 + 'px';
    circle.style.borderColor = txtColor;

    txt.innerText = Object.values(toCss(r,g,b,h,s,l)).toString().replace(/\)\,/g, ') ');
    txt.style.backgroundColor = toCss(r,g,b,h,s,l).hex;
    txt.style.color = txtColor;
    canvas.dispatchEvent(
      new CustomEvent('color-selected', {
        bubbles: true,
        detail: { r, g, b, h, s, l },
      })
    );
}

function rgb2hsl(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
}
  
function toCss(r, g, b, h, s, l) {
  const int2hex = (num) =>
    (Math.round(num) < 16 ? '0' : '') + Math.round(num).toString(16);

  return {
    rgb: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
    //hsl: `hsl(${Math.round(360 * h)},${Math.round(100 * s)}%,${Math.round(
    //  100 * l
    //)}%)`,
    hex: `#${int2hex(r)}${int2hex(g)}${int2hex(b)}`,
  };
}

palette_container.addEventListener("click", change_color);
function change_color(e) {
    color = palette_txt.style.backgroundColor;
}
// </palette>

// <line_width>
var line_width_input = document.getElementById("line_width");
line_width_input.addEventListener("change", change_line_width);

function change_line_width(e) {
    line_width = line_width_input.value;
}
// </line_width>

// <font_style>
var font_style = 'sans-serif';
var font_style_input = document.getElementById("font_style");
font_style_input.addEventListener("change", change_font_style);

function change_font_style(e) {
    font_style = font_style_input.value;
}
// </font_style>

// <font_size>
var font_size_input = document.getElementById("font_size");
font_size_input.addEventListener("change", change_font_size);

function change_font_size(e) {
    font_size = font_size_input.value;
}
// </font_size>

// <text>
var text_input = null;
var has_text_input = false;
var text_x = 0, text_y = 0;

function create_text(e) {   
    if (has_text_input) {
        document.body.removeChild(text_input);
    }
    text_input = document.createElement("input");    
    text_input.type = 'text';
    text_input.style.position = 'fixed';
    text_input.style.left = (e.clientX) + 'px';
    text_input.style.top = (e.clientY) + 'px';
    text_input.placeholder = 'Press "Enter" to print.'
    text_input.onkeydown = handle_enter;
    document.body.appendChild(text_input);
    text_input.focus();
    has_text_input = true;      
}

function handle_enter(e) {
    if (cur_tool != "text") {
        document.body.removeChild(text_input);
        return;
    }
    if (e.key == "Enter" || e.key == "Escape") {
        text_x = parseInt(text_input.style.left);
        text_y = parseInt(text_input.style.top);
        print_text(text_input.value, text_x, text_y);
        document.body.removeChild(text_input); 
        has_text_input = false;
    }
}

function print_text(txt, x, y) {
    ctx_bottom.textBaseline = 'top';
    ctx_bottom.textAlign = 'left';
    ctx_bottom.font = font_size + "px" + " " + font_style;
    ctx_bottom.fillStyle = color;
    ctx_bottom.fillText(txt, x - canvas_rect.left, y - canvas_rect.top);
}

canvas_top.addEventListener("mouseover", focusText);

function focusText(e) {
    window.requestAnimationFrame(focusText);
    if(has_text_input) {
        text_input.focus();
    }
}
// </text>

// <undo, redo>
var undo_list = [];
var redo_list = [];

function save_state(canvas, push_list) {
    (push_list || undo_list).push(canvas.toDataURL());
}

function Undo() {
    ctx_bottom.globalCompositeOperation = 'source-over';
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    if (undo_list.length > 0) {
        save_state(canvas_bottom, redo_list);
        var restore_state = undo_list.pop();
        var img = new Image();
        img.src = restore_state;
        img.onload = function() {
           ctx_bottom.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
           ctx_bottom.drawImage(img, 0, 0, canvas_bottom.width, canvas_bottom.height, 0, 0, canvas_bottom.width, canvas_bottom.height);  
        }
    }
}

function Redo() {
    ctx_bottom.globalCompositeOperation = 'source-over';
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    if (redo_list.length > 0) {
        save_state(canvas_bottom, undo_list);
        var restore_state = redo_list.pop();
        var img = new Image();
        img.src = restore_state;
        img.onload = function() {
           ctx_bottom.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
           ctx_bottom.drawImage(img, 0, 0, canvas_bottom.width, canvas_bottom.height, 0, 0, canvas_bottom.width, canvas_bottom.height);  
        }
    }
}
// </undo, redo>

// <upload>
var upload_input = document.addEventListener("change", Upload);
function Upload(e) {
    if(e.target.files) {
        save_state(canvas_bottom);
        let imageFile = e.target.files[0]; //here we get the image file
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = function (e) {
            var img = new Image(); // Creates image object
            img.src = e.target.result; // Assigns converted image to image object
            img.onload = function(ev) {
                var canvas = document.getElementById("canvas_bottom"); // Creates a canvas object
                var ctx = canvas.getContext("2d"); // Creates a contect object
                //canvas.width = img.width; // Assigns image's width to canvas
                //canvas.height = img.height; // Assigns image's height to canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2); // Draws the image on canvas
                //let imgData = canvas.toDataURL("image/jpeg",0.75); // Assigns image base64 string in jpeg format to a variable
            }
        }
    }
}
// </upload>

// <download>
function Download() {
    var link = document.createElement('a');
    link.download = 'my_canvas.png';
    link.href = document.getElementById('canvas_bottom').toDataURL()
    link.click();
}
// </download>

canvas_top.addEventListener("mousedown", start_painting);
canvas_top.addEventListener("mouseup", stop_painting);
canvas_top.addEventListener("mousemove", draw);
canvas_top.addEventListener("mouseout", beyond_boundary);

function ChangeTool(tool) {
    if (has_text_input) {
        document.body.removeChild(text_input); 
        has_text_input = false;
    }
    canvas_bottom.removeAttribute("class", cursor);
    canvas_top.removeAttribute("class", cursor);
    cur_tool = tool;
    cursor = "cursor_" + tool;
    canvas_bottom.setAttribute("class", cursor);
    canvas_top.setAttribute("class", cursor);
}

function change_pos(e) {
    if (cur_tool == "pen" || cur_tool == "eraser") {
        pos_x = e.clientX - canvas_rect.left;
        pos_y = e.clientY - canvas_rect.top + 22;
    }
    else {
        pos_x = e.clientX - canvas_rect.left;
        pos_y = e.clientY - canvas_rect.top;
    }
}

function start_painting(e) {
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    save_state(canvas_bottom);
    if (cur_tool == "pen" || cur_tool == "eraser" || cur_tool == "rainbow") {
        painting = true;
        draw(e);
    }
    if (cur_tool == "text") {
        create_text(e); 
    }
    if (cur_tool == "circle") {
        painting = true;
        change_pos(e);
        circle_x1 = pos_x;
        circle_y1 = pos_y;
        draw(e);
    }
    if (cur_tool == "triangle") {
        painting = true;
        change_pos(e);
        tri_start_x = pos_x;
        tri_start_y = pos_y;
        draw(e);
    }
    if (cur_tool == "rectangle") {
        painting = true;
        change_pos(e);
        rect_x1 = pos_x;
        rect_y1 = pos_y;
        draw(e);
    }
    
}

function stop_painting(e) {
    if (cur_tool == "pen" || cur_tool == "eraser" || cur_tool == "rainbow") {
        painting = false;
        ctx_bottom.beginPath();
    }
    if (cur_tool == "text") {
        
    }
    if (cur_tool == "circle") {
        painting = false;
        ctx_bottom.beginPath();
        ctx_bottom.ellipse(circle_center_x, circle_center_y, circle_radius, circle_radius, 0, 0, 2 * Math.PI);
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
    }
    if (cur_tool == "triangle") {
        painting = false;
        ctx_bottom.beginPath();
        ctx_bottom.moveTo(tri_x1, tri_y1);
        ctx_bottom.lineTo(tri_x2, tri_y2);
        ctx_bottom.lineTo(tri_x3, tri_y3);
        ctx_bottom.closePath();
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
    }
    if (cur_tool == "rectangle") {
        painting = false;
        ctx_bottom.beginPath();
        ctx_bottom.moveTo(rect_x1, rect_y1);
        ctx_bottom.lineTo(rect_x2, rect_y2);
        ctx_bottom.lineTo(rect_x3, rect_y3);
        ctx_bottom.lineTo(rect_x4, rect_y4);
        ctx_bottom.closePath();
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
    }
}

var circle_x1, circle_y1, circle_x2, circle_y2, circle_radius, circle_dx, circle_dy, circle_center_x, circle_center_y;
var tri_x1, tri_y1, tri_x2, tri_y2, tri_x3, tri_y3, tri_start_x, tri_start_y;
var rect_x1, rect_y1, rect_x2, rect_y2, rect_x3, rect_y3, rect_x4, rect_y4, rect_w, rect_h;
var hue = 0;

function draw(e) {  
    if (cur_tool == "pen") {
        if (!painting) 
            return;
        ctx_top.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
        ctx_bottom.globalCompositeOperation="source-over";
        ctx_bottom.lineCap = "round";
        ctx_bottom.lineWidth = line_width;
        ctx_bottom.strokeStyle = color;
        change_pos(e);
        ctx_bottom.lineTo(pos_x, pos_y);
        change_pos(e);
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
        ctx_bottom.moveTo(pos_x, pos_y);  
    }
    if (cur_tool == "eraser") {
        if (!painting) 
            return;
        ctx_top.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
        ctx_bottom.globalCompositeOperation="destination-out";
        ctx_bottom.lineCap = "round";
        ctx_bottom.lineWidth = line_width;
        change_pos(e);
        ctx_bottom.lineTo(pos_x, pos_y);
        change_pos(e);
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
        ctx_bottom.moveTo(pos_x, pos_y); 
    }
    if (cur_tool == "text") {
        ctx_bottom.globalCompositeOperation="source-over";
    }
    if (cur_tool == "circle") {
        if (!painting)
            return;
        ctx_bottom.globalCompositeOperation="source-over";
        change_pos(e);
        circle_x2 = pos_x;
        circle_y2 = pos_y;
        circle_dx = circle_x2 - circle_x1;
        circle_dy = circle_y2 - circle_y1;
        circle_center_x = (circle_x1 + circle_x2) / 2;
        circle_center_y = (circle_y1 + circle_y2) / 2;
        circle_radius = Math.abs(Math.sqrt((circle_dx / 2) * (circle_dx / 2) + (circle_dy / 2) * (circle_dy / 2)));
        ctx_bottom.lineWidth = line_width;
        ctx_bottom.strokeStyle = color;
        ctx_bottom.lineCap = "butt";
        ctx_top.lineWidth = line_width;
        ctx_top.strokeStyle = color;
        ctx_top.lineCap = "butt";
        ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
        ctx_top.beginPath();
        ctx_top.ellipse(circle_center_x, circle_center_y, circle_radius, circle_radius, 0, 0, 2 * Math.PI);
        ctx_top.stroke();
        ctx_top.beginPath();
    }
    if (cur_tool == "triangle") {
        if (!painting)
            return;
        ctx_bottom.globalCompositeOperation="source-over";
        change_pos(e);
        tri_x3 = pos_x;
        tri_y3 = pos_y;
        tri_x1 = (tri_start_x + tri_x3) / 2;
        tri_y1 = tri_start_y;
        tri_x2 = tri_start_x;
        tri_y2 = tri_y3;
        ctx_bottom.lineWidth = line_width;
        ctx_bottom.strokeStyle = color;
        ctx_bottom.lineCap = "butt";
        ctx_top.lineWidth = line_width;
        ctx_top.strokeStyle = color;
        ctx_top.lineCap = "butt";
        ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
        ctx_top.beginPath();
        ctx_top.moveTo(tri_x1, tri_y1);
        ctx_top.lineTo(tri_x2, tri_y2);
        ctx_top.lineTo(tri_x3, tri_y3);
        ctx_top.closePath();
        ctx_top.stroke();
        ctx_top.beginPath();
    }
    if (cur_tool == "rectangle") {
        if (!painting)
            return;
        ctx_bottom.globalCompositeOperation="source-over";
        change_pos(e);
        rect_x3 = pos_x;
        rect_y3 = pos_y;
        rect_x2 = rect_x1;
        rect_y2 = rect_y3;
        rect_x4 = rect_x3;
        rect_y4 = rect_y1;
        ctx_bottom.lineWidth = line_width;
        ctx_bottom.strokeStyle = color;
        ctx_bottom.lineCap = "butt";
        ctx_top.lineWidth = line_width;
        ctx_top.strokeStyle = color;
        ctx_top.lineCap = "butt";
        ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
        ctx_top.beginPath();
        ctx_top.moveTo(rect_x1, rect_y1);
        ctx_top.lineTo(rect_x2, rect_y2);
        ctx_top.lineTo(rect_x3, rect_y3);
        ctx_top.lineTo(rect_x4, rect_y4);
        ctx_top.closePath();
        ctx_top.stroke();
        ctx_top.beginPath();
    }
    if (cur_tool == "rainbow") {
        if (!painting) 
            return;
        
        ctx_top.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
        ctx_bottom.globalCompositeOperation="source-over";
        ctx_bottom.lineCap = "round";
        ctx_bottom.lineWidth = line_width;
        ctx_bottom.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        hue += 2;
        
        change_pos(e);
        ctx_bottom.lineTo(pos_x, pos_y);
        change_pos(e);
        ctx_bottom.stroke();
        ctx_bottom.beginPath();
        ctx_bottom.moveTo(pos_x, pos_y); 
    }
    else {
        ctx_bottom.globalCompositeOperation="source-over";
        ctx_bottom.lineCap = "round";
    }
}

function beyond_boundary(e) {
    if (cur_tool == "pen") {
        painting = false;
        ctx_bottom.beginPath();
    }
    if (cur_tool == "eraser") {
        painting = false;
        ctx_bottom.beginPath();
    }
    if (cur_tool == "text") {

    }
    if (cur_tool == "circle" || cur_tool == "triangle" || cur_tool == "rectangle") {

    }
}

function ClearAll() {
    save_state(canvas_bottom);
    ctx_bottom.clearRect(0, 0, canvas_bottom.width, canvas_bottom.height);
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    if (has_text_input) {
        document.body.removeChild(text_input); 
        has_text_input = false;
    }
}