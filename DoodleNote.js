/**
 * Copyright 2013 Shane Gavin <http://nodehead.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
###############################################################################
# The jQuery Plug-in
###############################################################################
*/
(function($)
{
$.fn.DoodleNote = function(modifiedSettings, modifiedLanguages)
{
    /*
     * Default color selection. This can be replaced at call time by passing
     * an array of hex values (without leading #) to the modifiedSettings
     * paramater with the following keys: 'toolColors', 'canvasColors'
     * color 선택하는 배열 'toolColors', 'canvasColor'
     */
    var colors =
    [
        'ffffff', '000000', 'eeeeee', 'cccccc', 'aaaaaa', '888888', '666666',
        '333333', 'aaccee', '6699cc', '336699', '003366', 'b3defd', '0197fd',
        '0169c9', '013397', '729fcf', '3465a4', '204a87', '015a01', '002b3d',
        'ff9bff', 'ff00ff', '6600cc', 'fdd99b', 'd9bb7a', '816647', 'eec73e',
        'f0a513', 'fb8b00', 'f44800', 'ffff99', 'ffff00', 'fdca01', '986601',
        'f44800', 'fd3301', 'd40000', '980101', 'fce94f', 'edd400', 'c4a000',
        '8ae234', '73d216', '4e9a06', 'fcaf3e', 'f57900', 'ce5c00', '729fcf',
        '3465a4', '204a87', 'ad7fa8', '75507b', '5c3566', 'e9b96e', 'c17d11',
        '8f5902', 'ef2929', 'cc0000', 'a40000', 'eeeeec', 'd3d7cf', 'babdb6',
        '888a85', '555753', '2e3436', 'ff0000', '00ff00', '0000ff'
    ];

    /**
     * Call-time configuration options and defaults
    *처음 실행했을 때 Setting 목록
     */
    var settings = $.extend(
    {
        'showToolbar'      : true,
        'showMouseInfo'    : true,
        'preventPageClose' : true,
        'tools'            : ['draw', 'line', 'erase', 'circle', 'rectangle'],
        'ctrls'            : ['layerSelect', 'colorSelect', 'options'],
        'defaultTool'      : 'draw',
        'toolColors'       : colors,
        'canvasColors'     : colors,
        'canvasColor'      : colors[0],
        'activeColor'      : colors[1],
        'defaultToolWidth' : 5,
        'maxToolWidth'     : 40,
        'defaultLineJoin'  : 'round',
        'defaultLineCap'   : 'round',
        'language'         : 'en-US',
    }, modifiedSettings);

    /**
     * Language parts. This can be replaced (or appended to, or modified) by
     * passing an object literal to the modifiedLanguages paramater. For example,
     * if you decide you would like the Draw tool to be named Pencil instead:
     * $('.target').DoodleNote(null, {'en-US': {'draw': {'title': 'Pencil'}}});
     */
    var languages = $.extend(true,
    {
        'en-US':
        {
            // Tools
            // 그리기 도구 선택
            'draw' : {'title': 'Draw'},
            'line' : {'title': 'Line'},
            'erase': {'title': 'Erase'},
            'circle': {'title': 'Circle'},
            'rectangle': {'title': 'Rectangle'},
            // Controls
            // 색상 선택
            'colorSelect':
            {
                'title' : 'Select Colors',
                'tool'  : 'Tool Color',
                'canvas': 'Canvas Color'
            },
            'layerSelect':
            {
                'title'       : 'Layers',
                'layer0Name'  : 'Background',
                'add'         : 'Add Layer',
                'delete'      : 'Delete Layer',
                'newName'     : 'Layer [NUM]',
                'newPrompt'   : 'Layer Name:',
                'renamePrompt': 'Rename [NAME] to:',
                'deletePrompt': 'Delete [NAME]?'
            },
            //옵션 모음
            'options':
            {
                'title'             : 'Extras',
                'resizeTool'        : 'Change Tool Radius',
                'clearLayer'        : 'Clear Layer Contents',
                'hardReset'         : 'Reset Everything',
                'exportImage'       : 'Export as Image (PNG)',
                'hardResetWarning'  : 'The drawing will be wiped out. Destroyed. Obliterated.' +
                                      '\n\nAre you sure you want to proceed?',
                'clearLayerWarning' : 'Everything on the current layer will be erased.' +
                                      '\n\nAre you sure you want to proceed?',
                'resizeToolPrompt'  : 'Enter desired tool size.' +
                                      '\n\nMinimum size: 1, 최대크기: [MAXSIZE].',
                'resizeToolWarning' : 'Tool size must be 1 or more, 최대크기 [MAXSIZE].',
                'save'              : 'Save',
                'load'              : 'Load'
            },
            // Other
            'unloadWarning': 'Warning: Your drawing(s) will be destroyed.'
        }
    }, modifiedLanguages);

    /**
     * The "Plug-in"
     */
    return this.each(function()
    {
        // Skip if this element is already a DoodleNote instance
        if ($(this).hasClass('DoodleNoteInstance')) return;
        var $this = $(this);
        // Grab local references to settings and chosen language parts
        $this.settings = settings;
        $this.language = languages[$this.settings['language']];
        // Mark this element as a DoodleNote instance and add styling class
        $this.addClass('DoodleNoteInstance');
        $this.addClass('DoodleNote');
        // Clear the container
        $this.html('');
        // Set-up layering and colours
        $this.layers = new DoodleNoteTool_layerSelect($this);
        $this.colors = new DoodleNoteTool_colorSelect($this);
        // Hold the generic tool properties
        $this.toolWidth    = settings.defaultToolWidth;
        $this.maxToolWidth = settings.maxToolWidth;
        $this.lineJoin     = settings.defaultLineJoin;
        $this.lineCap      = settings.defaultLineCap;
        // Hold the trigger name of the active tool
        $this.activeTool = undefined;
        // Append the toolbar, if specified
        if ($this.settings.showToolbar)
        {
            // The basic toolbar item
            var toolbar = new DoodleNote_Toolbar($this);
            // Add specified controls to toolbar
            if ($this.settings.ctrls.indexOf('options') != -1)
                toolbar.ctrls.push(new DoodleNoteTool_options($this));
            if ($this.settings.ctrls.indexOf('colorSelect') != -1)
                toolbar.ctrls.push($this.colors);
            if ($this.settings.ctrls.indexOf('layerSelect') != -1)
                toolbar.ctrls.push($this.layers);
            // Add specified tools
            if ($this.settings.tools.indexOf('draw') != -1)
                toolbar.tools.push(new DoodleNoteTool_draw($this));
            if ($this.settings.tools.indexOf('line') != -1)
                toolbar.tools.push(new DoodleNoteTool_line($this));
            if ($this.settings.tools.indexOf('erase') != -1)
                toolbar.tools.push(new DoodleNoteTool_erase($this));
            if ($this.settings.tools.indexOf('circle') != -1)
                toolbar.tools.push(new DoodleNoteTool_circle($this));
            if ($this.settings.tools.indexOf('rectangle') != -1)
                toolbar.tools.push(new DoodleNoteTool_rectangle($this));
            // Show the tool resizer
            if ($this.settings.showToolResize)
            {
                // alert("Hello");
            }
            // Add the toolbar into the DOM
            toolbar.build();
        }
        // Display mouse x and y position
        if ($this.settings.showMouseInfo)
        {
            $this.info = $('<div>', {'class': 'info'});
            $this.append($this.info);
            $this.on('mousemove', 'canvas', function(e)
            {
                e.stopPropagation();
                var offset = DoodleNoteUtil_canvasMousePos($this, e);
                $this.info.html('x:' + offset.x + '&nbsp;&nbsp;&nbsp;y:' + offset.y);
            }).on('mouseout', 'canvas', function()
            {
                $this.info.html('');
            });
        }
        // Prevent accidental page closes
        if ($this.settings['preventPageClose'])
        {
            $(window).bind('beforeunload', function()
            {
                return $this.language['unloadWarning'];
            });
        }
        // Intercept all link triggers in the container
        $this.on('click', 'a', function(e){e.preventDefault();});
        // Simulate a click on the default tool
        $this.find('a.' + $this.settings['defaultTool']).first().click();
    });
};
})(jQuery);

/*
# Select a list item excluseively (for tools and controls),
# Using the 'caller' reference, mark it as active and remove active flag from
# all siblings. If 'associatedSiblings' is specified, all elements in the
# parent instance with the passed class will be deactivated. If 'associated'
# is spedified, the element(s) with that class name will be activated.
# If keepAlibe is true, clicking on an active triger will not deactivate it.
*/
function DoodleNoteUtil_selectEx(DoodleNote, caller, associated, associatedSiblings, keepAlive)
{
    // Find the caller siblings
    var callerSiblings = caller.parent().siblings('li').children('a');
    // Find the controller, if specified
    associated = (associated === undefined)? associated: DoodleNote.find(associated).first();
    // Record the active state
    var wasActive = caller.hasClass('active');
    // Activate / Deactivate Triggers
    if (wasActive)
    {
        if (!keepAlive) caller.removeClass('active');
        if (associated !== undefined) associated.fadeOut(150);
    }
    else
    {
        callerSiblings.removeClass('active');
        caller.addClass('active');
        if (associatedSiblings !== undefined)
            DoodleNote.find(associatedSiblings + ':visible').fadeOut(150);
        if (associated !== undefined)
            associated.fadeIn(150);
    }
}
/*
# Create event handlers to activate a tool
*/
function DoodleNoteUtil_createToolTrigger(caller)
{
    caller.DoodleNote.find('a.' + caller.trigger).first().click(function()
    {
        DoodleNoteUtil_selectEx(caller.DoodleNote, $(this), undefined, undefined, true);
        caller.DoodleNote.activeTool = caller.trigger;
    });
}
/*
# Create event handlers to activate a control
# associated is the class of the associated controller.
# associatedSiblings is the class of all controllers of this type
# A resulting event trigger will hide associatedSiblings and show associated
# or hide associated if it's already showing.
*/
function DoodleNoteUtil_createControlTrigger(caller, associated, associatedSiblings)
{
    caller.DoodleNote.find('a.' + caller.trigger).first().click(function()
    {
        DoodleNoteUtil_selectEx(caller.DoodleNote, $(this), associated, associatedSiblings);
    });
}
/*
# Get mouse x and y position relative to canvas
*/
//canvas안에 있는 마우스의 x,y 좌표값을 리턴
function DoodleNoteUtil_canvasMousePos(parent, mouse)
{
    var offset = parent.offset();
    return {
        x: Math.floor(mouse.pageX - offset.left),
        y: Math.floor(mouse.pageY - offset.top - 32),
    };
}
/*
# Set-up event handlers for the specified object, which initiate path drawing,
# to specified parameters. The calling tool should pass itself as caller and
# should specify the preferred lineJoin and lineCap types. Operation can also
# be additive (draw) or subtractive (erase)
# !IMPORTANT This refactored version makes use of the smoothing procedure
# detailed by user Simon Sarris @ http://stackoverflow.com/questions/10567287/
*/
function DoodleNoteUtil_bindLineEvents(caller, lineJoin, lineCap, additive)
{
    this.DoodleNote  = caller.DoodleNote;
    this.compOp = (additive)? 'source-over': 'destination-out';
    this.offset = undefined;
    this.points = [];
    this.ctx    = null;
    this.layer  = null;

    var mouseDown = false;
    var DoodleNote= this.DoodleNote;
    var self      = this;

    DoodleNote.on('mousedown', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == caller.trigger)
        {
            // Initiate drawing
            mouseDown = true;
            // Get the toolCanvas context
            self.ctx = DoodleNote.layers.toolCanvas[0].getContext('2d');
            // Set the composite operation and styling
            self.ctx.globalCompositeOperation = self.compOp;
            self.ctx.lineWidth                = DoodleNote.toolWidth;
            self.ctx.lineJoin                 = lineJoin;
            self.ctx.lineCap                  = lineCap;
            // Set the stroke style
            self.ctx.strokeStyle = (additive)? '#' + DoodleNote.colors.activeColor: 'rgba(0,0,0,1)';
            self.ctx.fillStyle   = self.ctx.strokeStyle;
            // Push first point
            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            self.points.push({'x': self.offset.x, 'y': self.offset.y});
            // Get the operating layer
            self.layer = DoodleNote.layers.indexOf(DoodleNote.layers.activeLayer);
            // Hide the active layer canvas (work will take place on the tool canvas)
            DoodleNote.layers.layers[self.layer]['canvas'].hide();
            // Draw to current state
            self.draw(false);
            // Prevents cursor changing to a selection pointer
            return false;
        }
    }).on('mousemove', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == caller.trigger && mouseDown)
        {
            // Push point
            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            self.points.push({'x': self.offset.x, 'y': self.offset.y});
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);
            // Draw to current state
            self.draw(false);
        }
    }).on('mouseup mouseout', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == caller.trigger && mouseDown)
        {
            // Terminate drawing
            mouseDown = false;
            // Unhide the active layer canvas
            DoodleNote.layers.layers[self.layer]['canvas'].show();
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);
            // Get the layer context
            self.ctx = DoodleNote.layers.layers[self.layer]['ctx'];
            // Set the composite operation and styling
            self.ctx.globalCompositeOperation = self.compOp;
            self.ctx.lineWidth                = DoodleNote.toolWidth;
            self.ctx.lineJoin                 = lineJoin;
            self.ctx.lineCap                  = lineCap;
            // Set the stroke style
            self.ctx.strokeStyle = (additive)? '#' + DoodleNote.colors.activeColor: 'rgba(0,0,0,1)';
            self.ctx.fillStyle   = self.ctx.strokeStyle;
            // Draw to current state
            self.draw(true);
            // Reset
            self.points = [];
        }
    });
}
DoodleNoteUtil_bindLineEvents.prototype.draw = function(drawReal)
{
    // Copy the active canvas to the toolCanvas (needed for subtractive operations)
    if (!drawReal)
    {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(this.DoodleNote.layers.layers[this.layer]['canvas'][0], 0, 0);
        this.ctx.globalCompositeOperation = this.compOp;
    }
    //# !IMPORTANT with only a few small changes to better accomodate layering, this
    //# method has been copied almost verbatim from the jsFiddle linked to by user
    //# Simon Sarris @ http://stackoverflow.com/questions/10567287/
    // For short movements, draw a simple circle
    if (this.points.length < 6)
    {
        var b = this.points[0];
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0);
        this.ctx.closePath();
        this.ctx.fill();
    }
    else
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (i = 1; i < this.points.length - 2; i++)
        {
            var c = (this.points[i].x + this.points[i + 1].x) / 2;
            var d = (this.points[i].y + this.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
        }
        this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y,
                                  this.points[i + 1].x, this.points[i + 1].y);
        this.ctx.stroke();
    }
};
// The Colour Picker Control
function DoodleNoteTool_colorSelect(DoodleNote)
{
    // Initialisation
    this.DoodleNote       = DoodleNote;
    this.title       = this.DoodleNote.language['colorSelect']['title'];
    this.trigger     = 'colorSelect';
    this.activeColor = this.DoodleNote.settings.activeColor;
    this.canvasColor = this.DoodleNote.settings.canvasColor;
    // Push the HTML
    this.DoodleNote.append('<div class=\'colorSelectCtrl ctrlr\'>' +
        '<p>' + this.DoodleNote.language['colorSelect']['tool'] + '</p><ul></ul>' +
        '<p>' + this.DoodleNote.language['colorSelect']['canvas'] + '</p><ul></ul></div>'
        );
    // Cache the selection menus
    var activeSelect = DoodleNote.find('.colorSelectCtrl>ul:first-of-type');
    var canvasSelect = DoodleNote.find('.colorSelectCtrl>ul:last-of-type');
    // Push the tool colors
    for (i = 0; i < this.DoodleNote.settings.toolColors.length; ++i)
    {
        activeSelect.append(
            $('<li>').append(
                $('<a>',{
                    'href' : '#', 'class' : this.DoodleNote.settings.toolColors[i],
                    'title': '#' + this.DoodleNote.settings.toolColors[i]
                }).css(
                    'backgroundColor', '#' + this.DoodleNote.settings.toolColors[i]
                    )
                )
            );
    }
    // Push the canvas colors
    for (i = 0; i < this.DoodleNote.settings.canvasColors.length; ++i)
    {
        canvasSelect.append(
            $('<li>').append(
                $('<a>',{
                    'href' : '#', 'class' : this.DoodleNote.settings.canvasColors[i],
                    'title': '#' + this.DoodleNote.settings.toolColors[i]
                }).css(
                    'backgroundColor', '#' + this.DoodleNote.settings.canvasColors[i]
                    )
                )
            );
    }
    // Flag selected colours as active
    activeSelect.find('a.' + this.activeColor).addClass('active');
    canvasSelect.find('a.' + this.canvasColor).addClass('active');
    // Set the initial canvas colour
    DoodleNote.css('backgroundColor', '#' + this.canvasColor);
}

DoodleNoteTool_colorSelect.prototype.init = function()
{
    var self  = this;
    var DoodleNote = this.DoodleNote;
    // Event Handlers [Trigger]
    DoodleNoteUtil_createControlTrigger(this, '.colorSelectCtrl', '.ctrlr');
    // Event Handlers [Ctrl]
    var activeSelects = DoodleNote.find('.colorSelectCtrl>ul:first-of-type a');
    activeSelects.click(function()
    {
        activeSelects.removeClass('active');
        $(this).addClass('active');
        self.activeColor = $(this).attr('class').split(' ')[0];
    });
    var canvasSelects = DoodleNote.find('.colorSelectCtrl>ul:last-of-type a');
    canvasSelects.click(function()
    {
        canvasSelects.removeClass('active');
        $(this).addClass('active');
        self.canvasColor = $(this).attr('class').split(' ')[0];
        DoodleNote.css('backgroundColor', '#' + self.canvasColor);
    });
};
// Extra Options
function DoodleNoteTool_options(DoodleNote)
{
    // initialisation
    this.DoodleNote       = DoodleNote;
    this.title       = this.DoodleNote.language['options']['title'];
    this.trigger     = 'options';
    this.container   = $('<div>', {'class': 'optionsCtrl ctrlr'});
    this.resizeTool  = $('<a>', {'href': '#', 'class': 'resizeTool'});
    this.hardReset   = $('<a>', {'href': '#', 'class': 'hardReset'});
    this.clearLayer  = $('<a>', {'href': '#', 'class': 'clearLayer'});
    this.exportImage = $('<a>', {'href': '#', 'class': 'exportImage'});
    this.save        = $('<a>', {'href': '#', 'class': 'save'});
    this.load        = $('<a>', {'href': '#', 'class': 'load'});
    // Push the HTML
    this.resizeTool.text(this.DoodleNote.language['options']['resizeTool']);
    this.container.append(this.resizeTool);

    this.clearLayer.text(this.DoodleNote.language['options']['clearLayer']);
    this.container.append(this.clearLayer);

    this.hardReset.text(this.DoodleNote.language['options']['hardReset']);
    this.container.append(this.hardReset);

    this.exportImage.text(this.DoodleNote.language['options']['exportImage']);
    this.container.append(this.exportImage);

    this.save.text(this.DoodleNote.language['options']['save']);
    this.container.append(this.save);

    this.load.text(this.DoodleNote.language['options']['load']);
    this.container.append(this.load);

    this.DoodleNote.append(this.container);
}

DoodleNoteTool_options.prototype.init = function()
{
    var self   = this;
    var DoodleNote  = this.DoodleNote;
    var layers = this.DoodleNote.layers;
    var colors = this.DoodleNote.colors;
    // Event Handlers [Trigger]
    DoodleNoteUtil_createControlTrigger(this, '.optionsCtrl', '.ctrlr');
    // Event handlers [Tool radius]
    this.resizeTool.on('click', function(e)
    {
        // Prompt for new size
        var promptMsg   = DoodleNote.language['options']['resizeToolPrompt'].replace('\[MAXSIZE\]', DoodleNote.maxToolWidth);
        var newSize     = parseInt(prompt(promptMsg, DoodleNote.toolWidth));
        if (!newSize) return;
        // Enforce tool tool size limits
        if (newSize < 1 || newSize > DoodleNote.maxToolWidth)
        {
            alert(DoodleNote.language['options']['resizeToolWarning'].replace('\[MAXSIZE\]', DoodleNote.maxToolWidth));
            return;
        }
        else
            DoodleNote.toolWidth = newSize;
    });
    // Event handlers [Hard Reset]
    this.hardReset.on('click', function(e)
    {
        // Confirm
        var confirmed = confirm(DoodleNote.language['options']['hardResetWarning']);
        if (!confirmed) return;
        e.preventDefault();
        // Reset
        $('.textarea').val('');
        DoodleNote.removeClass('DoodleNoteInstance');
        DoodleNote.removeClass('DoodleNote');
        DoodleNote.DoodleNote();
    });
    // Event handlers [Clear Layer]
    this.clearLayer.on('click', function(e)
    {
        // Confirm
        var confirmed = confirm(DoodleNote.language['options']['clearLayerWarning']);
        if (!confirmed) return;
        e.preventDefault();
        // Clear
        var layer = layers.indexOf(layers.activeLayer);
        layers.layers[layer]['ctx'].clearRect(0, 0, layers.width, layers.height);
    });
    // Event handler [Export Image]
    this.exportImage.on('click', function()
    {
        // Create a temporary canvas
        var canvas = $('<canvas>');
        canvas.attr('width',  layers.width);
        canvas.attr('height', layers.height);
        var ctx = canvas[0].getContext('2d');
        // Fill the canvas with the canvas color
        ctx.beginPath();
        ctx.fillStyle = '#' + colors.canvasColor;
        ctx.fillRect(0, 0, layers.width, layers.height);
        ctx.closePath();
        // Overlay each layer on the canvas
        ctx.globalCompositeOperation = 'source-over';
        for (i = 0; i < layers.layers.length; i++)
        {
            ctx.drawImage(layers.layers[i]['canvas'][0], 0, 0);
        }
        // Get the canvas as an image (base64 encoded PNG)
        var data = canvas[0].toDataURL();
        // Open the image in a new tab
        window.open(data, '_blank');
    });
    // Event handler [save]
    this.save.on('click', function() {
      alert("click save");
    });
    // Event handler [load]
    this.load.on('click', function() {
      alert("click load");
    });
};

// Layer Select
function DoodleNoteTool_layerSelect(DoodleNote)
{
    // Initialisation
    this.DoodleNote       = DoodleNote;
    this.title       = this.DoodleNote.language['layerSelect']['title'];
    this.trigger     = 'layerSelect';
    this.layers      = [];
    this.activeLayer = null;
    this.height      = (this.DoodleNote.height() - 32); // 32px for toolbar
    this.width       = this.DoodleNote.width();
    this.container   = $('<ul>', {'class': 'layerSelectCtrl ctrlr'});
    this.toolCanvas  = $('<canvas>', {'class': 'toolCanvas'});
    this.layerCount  = 0;
    // Add a dummy canvas for tools to use
    this.toolCanvas.attr({'width': this.width, 'height': this.height});
    this.DoodleNote.prepend(this.toolCanvas);
    // Create initial layer
    this.createLayer('Background');
    // Push the container html
    this.DoodleNote.append(this.container);
    // Push the add layer button
    this.container.append
    (
        $('<li>').append($('<a>',
        {
            'href': '#',
            'title': this.DoodleNote.language['layerSelect']['add']
        }))
    );
    //Initial Build
    this.build();
    // Select top layer
    this.selectLayer();
}

DoodleNoteTool_layerSelect.prototype.indexOf = function(realName)
{
    for (i = 0; i < this.layers.length; i++)
    {
        if (this.layers[i]['realName'] === realName)
            return i;
    }
    return -1;
};

DoodleNoteTool_layerSelect.prototype.createLayer = function(name)
{
    var realName = 'layer' + this.layerCount;
    var layer    = {
        'canvas'   : $('<canvas />', {'class':  realName}),
        'ctx'      : null,
        'name'     : name,
        'realName' : realName
        }
    layer['canvas'].attr({'width': this.width, 'height': this.height});
    layer['ctx'] = layer['canvas'][0].getContext('2d');

    this.layers.push(layer);
    ++this.layerCount;

    var hasLayers = this.DoodleNote.find('.layerSelectCtrl');
    if (hasLayers.length > 0) {
        layer['canvas'].insertBefore(this.DoodleNote.find('.layerSelectCtrl'));
      }
    else {
        this.DoodleNote.prepend(layer['canvas']);
      }
};

DoodleNoteTool_layerSelect.prototype.build = function()
{
    // Clear the container contents
    this.container.find('li:not(:last-of-type)').remove();
    // Push layer entries HTML
    for (i = 0; i < this.layers.length; ++i)
    {
        this.container.prepend(
            '<li title=\'' + this.layers[i]['name'] +
            '\' class=\'' + this.layers[i]['realName'] +
            '\'><a href=\'#\' title=\'' + this.DoodleNote.language['layerSelect']['delete'] + '\'></a>' +
            this.layers[i]['name'] + '</li>');
    }
}

DoodleNoteTool_layerSelect.prototype.selectLayer = function(caller)
{
    // Remove all layer active flags
    this.container.find('li').removeClass('active');
    // If no caller is passed, select the highest layer
    if (caller == undefined)
        caller = this.container.find('li.' + this.layers[(this.layers.length - 1)]['realName']);
    // Select layer
    caller.addClass('active');
    var layer        = this.indexOf(caller.attr('class').split(' ')[0]);
    this.activeLayer = this.layers[layer].realName;
    // Move the toolCanvas to above the active layer
    var toolCanvas = this.toolCanvas.detach();
    toolCanvas.insertAfter(this.layers[layer]['canvas']);
}

DoodleNoteTool_layerSelect.prototype.init = function()
{
    var self   = this;
    var DoodleNote  = this.DoodleNote;
    var layers = this.layers;
    // Event Handlers [Trigger]
    DoodleNoteUtil_createControlTrigger(this, '.layerSelectCtrl', '.ctrlr');
    // Event Handler [Add Layer]
    this.container.on('click', 'li:last-of-type>a', function()
    {
        // Add
        // Prompt for Layer Name
        var defaultName = DoodleNote.language['layerSelect']['newName'].replace('\[NUM\]', self.layerCount);
        var name        = prompt(DoodleNote.language['layerSelect']['newPrompt'], defaultName);
        if (!name) return;
        else name       = (name !== null && name.length > 0)? name: defaultName;
        // Create Layer
        self.createLayer(name);
        // Redraw
        self.build();
        // Simulate selection click
        self.container.children('li:first-of-type').click();
    }).on('click', 'li:not(:last-of-type)', function()
    {
        // Select
        self.selectLayer($(this));
    }).on('dblclick', 'li:not(:last-of-type)', function()
    {
        // Rename
        // Find the object reference
        var layer = self.indexOf($(this).attr('class').split(' ')[0]);

        if (layer !== -1)
        {
            // Prompt for new Layer Name
            var defaultName = layers[layer]['name'];
            var promptMsg   = DoodleNote.language['layerSelect']['renamePrompt'].replace('\[NAME\]', defaultName);
            var name        = prompt(promptMsg, defaultName);
            if (!name) return;
            else name       = (name.length > 0)? name: defaultName;
            // Update the layer and rebuild
            layers[layer]['name'] = name;
            self.build();
            // Simulate selection click
            self.container.find('.' + layers[layer]['realName']).click();
        }
    }).on('click', 'li:not(:last-of-type)>a', function(e)
    {
        // Delete
        // Prevent the click event triggering on the parent
        e.stopPropagation();
        e.preventDefault();
        // Find the object reference
        var layer = self.indexOf($(this).parent().attr('class').split(' ')[0]);
        if (layer === -1 || layer === 0) return;
        // Prompt for confirmation
        var promptMsg = DoodleNote.language['layerSelect']['deletePrompt'].replace('\[NAME\]', layers[layer]['name']);
        var confirmed = confirm(promptMsg);
        if (!confirmed) return;
        // Remove the associated canvas and menu item from the DOM
        DoodleNote.find('.' + layers[layer]['realName']).remove();
        // Remove the collection item
        layers.splice(layer, 1);
        // Rebuild container
        self.build();
        // Select top layer
        self.selectLayer();
    });
}

// Draw
function DoodleNoteTool_draw(DoodleNote)
{
    // initialisation
    this.DoodleNote     = DoodleNote;
    this.title     = this.DoodleNote.language['draw']['title'];
    this.trigger   = 'draw';
    this.lineJoin  = this.DoodleNote.lineJoin;
    this.lineCap   = this.DoodleNote.lineCap;
};
DoodleNoteTool_draw.prototype.init = function()
{
    // Event Handlers [Trigger]
    DoodleNoteUtil_createToolTrigger(this);

    // Event handlers [Tool]
    new DoodleNoteUtil_bindLineEvents(this, this.lineJoin, this.lineCap, true);
};

// Erase
function DoodleNoteTool_erase(DoodleNote)
{
    // initialisation
    this.DoodleNote    = DoodleNote;
    this.title    = this.DoodleNote.language['erase']['title'];
    this.trigger  = 'erase';
    this.lineJoin = this.DoodleNote.lineJoin;
    this.lineCap  = this.DoodleNote.lineCap;
};
DoodleNoteTool_erase.prototype.init = function()
{
    // Event Handlers [Trigger]
    DoodleNoteUtil_createToolTrigger(this);
    // Event handlers [Tool]
    new DoodleNoteUtil_bindLineEvents(this, this.lineJoin, this.lineCap, false);
};

// Line
function DoodleNoteTool_line(DoodleNote)
{
    // initialisation
    this.DoodleNote    = DoodleNote;
    this.title    = this.DoodleNote.language['line']['title'];
    this.trigger  = 'line';
    this.lineJoin = this.DoodleNote.lineJoin;
    this.lineCap  = this.DoodleNote.lineCap;
    this.drawing  = false;
    this.points   = [];
    this.offset   = undefined;
    this.ctx      = null;
    this.layer    = null;
};
DoodleNoteTool_line.prototype.init = function()
{
    // Event Handlers [Trigger]
    DoodleNoteUtil_createToolTrigger(this);
    // Event handlers [Tool]
    var self    = this;
    var DoodleNote   = this.DoodleNote;

    this.DoodleNote.on('mousedown', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger)
        {
            if (!self.drawing)
            {
                // Initiate drawing
                self.drawing = true;
                // Get the toolCanvas context
                self.ctx = DoodleNote.layers.toolCanvas[0].getContext('2d');
                // Set the composite operation and styling
                self.ctx.lineWidth                = DoodleNote.toolWidth;
                self.ctx.lineJoin                 = self.lineJoin;
                self.ctx.lineCap                  = self.lineCap;
                self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
                self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
                self.ctx.globalCompositeOperation = 'source-over';
                // Push first point
                self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                self.points.push({'x': self.offset.x, 'y': self.offset.y});
                // self.points.push({'x': e.pageX - this.offsetLeft, 'y': e.pageY - this.offsetTop});
                // Get the operating layer
                self.layer = DoodleNote.layers.indexOf(DoodleNote.layers.activeLayer);
                // Draw to current state
                self.draw();
                // Prevents cursor changing to a selection pointer
                return false;
            }
            else
            {
                self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                self.points.push({'x': self.offset.x, 'y': self.offset.y});
                // self.points.push({'x': e.pageX - this.offsetLeft, 'y': e.pageY - this.offsetTop});
            }
        }
    }).on('mousemove', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);

            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            self.draw();
        }
    }).on('dblclick mouseout', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // Terminate drawing
            self.drawing = false;
            // Get last set of points
            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);
            // Get the layer context
            self.ctx = DoodleNote.layers.layers[self.layer]['ctx'];
            // Set the composite operation and styling
            self.ctx.lineWidth                = DoodleNote.toolWidth;
            self.ctx.lineJoin                 = self.lineJoin;
            self.ctx.lineCap                  = self.lineCap;
            self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
            self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
            self.ctx.globalCompositeOperation = 'source-over';
            // Draw final state
            self.draw();
            // Reset
            self.points = [];
        }
    });
};
DoodleNoteTool_line.prototype.draw = function()
{
    // Draw initial point
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    this.ctx.beginPath();
    // Line to all points (including first, for smooth operation)
    this.ctx.beginPath();
    for (i = 0; i < this.points.length; i++)
    {
        this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    // Line to the mouse position if still drawing
    if (this.drawing)
        this.ctx.lineTo(this.offset.x, this.offset.y);

    this.ctx.stroke();
};

// circle
function DoodleNoteTool_circle(DoodleNote)
{
    // initialisation
    this.DoodleNote    = DoodleNote;
    this.title    = this.DoodleNote.language['circle']['title'];
    this.trigger  = 'circle';
    this.lineJoin = this.DoodleNote.lineJoin;
    this.lineCap  = this.DoodleNote.lineCap;
    this.drawing  = false;
    this.points   = [];
    this.offset   = undefined;
    this.ctx      = null;
    this.layer    = null;
};
DoodleNoteTool_circle.prototype.init = function()
{
    // Event Handlers [Trigger]
    DoodleNoteUtil_createToolTrigger(this);
    // Event handlers [Tool]
    // new DoodleNoteUtil_bindLineEvents(this, this.lineJoin, this.lineCap, false);
    var self    = this;
    var DoodleNote   = this.DoodleNote;

    this.DoodleNote.on('mousedown', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger)
        {
            if (!self.drawing)
            {
                // Initiate drawing
                self.drawing = true;
                // Get the toolCanvas context
                self.ctx = DoodleNote.layers.toolCanvas[0].getContext('2d');
                // Set the composite operation and styling
                self.ctx.lineWidth                = DoodleNote.toolWidth;
                self.ctx.lineJoin                 = self.lineJoin;
                self.ctx.lineCap                  = self.lineCap;
                self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
                self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
                self.ctx.globalCompositeOperation = 'source-over';
                // Push first point
                self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                self.points.push({'x': self.offset.x, 'y': self.offset.y});
                // Get the operating layer
                self.layer = DoodleNote.layers.indexOf(DoodleNote.layers.activeLayer);
                // Draw to current state
                self.draw();
                // Prevents cursor changing to a selection pointer
                return false;
            }
            else
            {
                // self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                // self.points.push({'x': self.offset.x, 'y': self.offset.y});
                self.points.push({'x': e.pageX - this.offsetLeft, 'y': e.pageY - this.offsetTop})
            }
        }
    }).on('mousemove', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);

            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            self.draw();
        }
    }).on('dblclick mouseout', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // Terminate drawing
            self.drawing = false;
            // Get last set of points
            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);
            // Get the layer context
            self.ctx = DoodleNote.layers.layers[self.layer]['ctx'];
            // Set the composite operation and styling
            self.ctx.lineWidth                = DoodleNote.toolWidth;
            self.ctx.lineJoin                 = self.lineJoin;
            self.ctx.lineCap                  = self.lineCap;
            self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
            self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
            self.ctx.globalCompositeOperation = 'source-over';
            // Draw final state
            self.draw();
            // Reset
            self.points = [];
        }
    });
};


DoodleNoteTool_circle.prototype.draw = function()
{
    // Draw initial point
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    // this.ctx.beginPath();

    // Line to all points (including first, for smooth operation)
    this.ctx.beginPath();
    for (i = 0; i < this.points.length; i++)
    {
        this.ctx.arc(this.points[i].x, this.points[i].y,40,0,Math.PI*2);
    }

    // this.ctx.closePath();
    // Circle to the mouse position if still drawing
    if (this.drawing)
        // this.ctx.moveTo(this.offset.x, this.offset.y);
        this.ctx.arc(this.offset.x, this.offset.y,40,0,Math.PI*2);

    // this.ctx.closePath();
    this.ctx.stroke();
};

// rectangle
function DoodleNoteTool_rectangle(DoodleNote)
{
    // initialisation
    this.DoodleNote    = DoodleNote;
    this.title    = this.DoodleNote.language['rectangle']['title'];
    this.trigger  = 'rectangle';
    this.lineJoin = this.DoodleNote.lineJoin;
    this.lineCap  = this.DoodleNote.lineCap;
    this.drawing  = false;
    this.points   = [];
    // this.endpoints = [];
    this.offset   = undefined;
    this.ctx      = null;
    this.layer    = null;
};

DoodleNoteTool_rectangle.prototype.init = function()
{
    // Event Handlers [Trigger]
    DoodleNoteUtil_createToolTrigger(this);
    // Event handlers [Tool]
    // new DoodleNoteUtil_bindLineEvents(this, this.lineJoin, this.lineCap, true);
    var self    = this;
    var DoodleNote   = this.DoodleNote;

    this.DoodleNote.on('mousedown', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger)
        {
            if (!self.drawing)
            {
                // Initiate drawing
                self.drawing = true;
                // Get the toolCanvas context
                self.ctx = DoodleNote.layers.toolCanvas[0].getContext('2d');
                // Set the composite operation and styling
                self.ctx.lineWidth                = DoodleNote.toolWidth;
                self.ctx.lineJoin                 = self.lineJoin;
                self.ctx.lineCap                  = self.lineCap;
                self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
                self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
                self.ctx.globalCompositeOperation = 'source-over';
                // Push first point
                self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                self.points.push({'x': self.offset.x, 'y': self.offset.y});
                // self.points.push({'x': e.pageX - this.offsetLeft, 'y': e.pageY - this.offsetTop});
                // Get the operating layer
                self.layer = DoodleNote.layers.indexOf(DoodleNote.layers.activeLayer);
                // Draw to current state
                self.draw();
                // Prevents cursor changing to a selection pointer
                return false;
            }
            else
            {
                // self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
                // self.points.push({'x': self.offset.x, 'y': self.offset.y});
                self.points.push({'x': e.pageX - this.offsetLeft, 'y': e.pageY - this.offsetTop});
            }
        }
    }).on('mousemove', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // rect.w = (e.pageX - this.offsetLeft) - rect.startX;
            // rect.h = (e.pageY - this.offsetTop) - rect.startY;
              // self.endpoints.push({'w': (e.pageX - this.offsetLeft) - this.points.[0].x, 'h': (e.pageY - this.offsetTop) - this.points[0].y});
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);

            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            self.draw();
        }
    }).on('dblclick mouseout', 'canvas', function(e)
    {
        if (DoodleNote.activeTool == self.trigger && self.drawing)
        {
            // Terminate drawing
            self.drawing = false;
            // Get last set of points
            self.offset = DoodleNoteUtil_canvasMousePos(DoodleNote, e);
            // Clear the toolCanvas
            self.ctx.clearRect(0, 0, DoodleNote.layers.width, DoodleNote.layers.height);
            // Get the layer context
            self.ctx = DoodleNote.layers.layers[self.layer]['ctx'];
            // Set the composite operation and styling
            self.ctx.lineWidth                = DoodleNote.toolWidth;
            self.ctx.lineJoin                 = self.lineJoin;
            self.ctx.lineCap                  = self.lineCap;
            self.ctx.strokeStyle              = '#' + DoodleNote.colors.activeColor;
            self.ctx.fillStyle                = '#' + DoodleNote.colors.activeColor;
            self.ctx.globalCompositeOperation = 'source-over';
            // Draw final state
            self.draw();
            // Reset
            self.points = [];
        }
    });
};

DoodleNoteTool_rectangle.prototype.draw = function()
{
    // Draw initial point
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    this.ctx.beginPath();

    //Rect to all points (including first, for smooth operation)
    this.ctx.beginPath();
    for (i = 0; i < this.points.length; i++)
    {
        // this.ctx.strokeRect(this.points[0].x, this.points[0].y, this.endpoints[i].x, this.endpoints[i].y);
        this.ctx.strokeRect(this.points[i].x, this.points[i].y, 40, 40);
    }

    //Rect to the mouse position if still drawing
    if (this.drawing)
        // this.ctx.strokeRect(this.offset.x, this.offset.y, 0, 0);
        this.ctx.strokeRect(this.offset.x, this.offset.y,40,40);


    this.ctx.stroke();
    // this.ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
};

//Toolbar
function DoodleNote_Toolbar(DoodleNote, settings)
{
    this.DoodleNote = DoodleNote;
    this.tools = [];
    this.ctrls = [];
};

//Toolbar Build up
DoodleNote_Toolbar.prototype.build = function()
{
    // Container
    var $toolbar = $('<div>', {'class': 'toolbar'});

    // Tools
    var $tools = $('<ul>');
    for (i = 0; i < this.tools.length; ++i)
    {
        var $item = $('<li>');
        var $link = $('<a>', { 'class': this.tools[i].trigger,
                               'title': this.tools[i].title,
                               'href':  '#'});
        $item.append($link);
        $tools.append($item);
    }

    // Controls
    var $ctrls = $('<ul>');
    for (i = 0; i < this.ctrls.length; ++i)
    {
        var $item = $('<li>');
        var $link = $('<a>', { 'class': this.ctrls[i].trigger,
                               'title': this.ctrls[i].title,
                               'href':  '#'});
        $item.append($link);
        $ctrls.append($item);
    }

    // Push the HTML
    $toolbar.append($tools);
    $toolbar.append($ctrls);
    this.DoodleNote.append($toolbar);

    // Initialise event handlers for all toolbar items
    for (i = 0; i < this.tools.length; ++i) this.tools[i].init();
    for (i = 0; i < this.ctrls.length; ++i) this.ctrls[i].init();
};

$(document).ready(function(){
    $('.DoodleNote').DoodleNote();
});
