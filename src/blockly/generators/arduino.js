/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Arduino for blocks.
 * @author gasolin@gmail.com (Fred Lin)
 */
'use strict';

goog.provide('Blockly.Arduino');

goog.require('Blockly.Generator');


/**
 * Arduino code generator.
 * @type !Blockly.Generator
 */
Blockly.Arduino = new Blockly.Generator('Arduino');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Arduino.addReservedWords(
  // http://arduino.cc/en/Reference/HomePage
  'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,interger, constants,floating,point,void,bookean,char,unsigned,byte,int,word,long,float,double,string,String,array,static, volatile,const,sizeof,pinMode,digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone,noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt,detachInterrupt,interrupts,noInterrupts,map,mapFloat'
);

/**
 * Order of operation ENUMs.
 *
 */
Blockly.Arduino.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Arduino.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Arduino.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Arduino.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Arduino.ORDER_ADDITIVE = 4;       // + -
Blockly.Arduino.ORDER_SHIFT = 5;          // << >>
Blockly.Arduino.ORDER_RELATIONAL = 6;     // is is! >= > <= <
Blockly.Arduino.ORDER_EQUALITY = 7;       // == !=
Blockly.Arduino.ORDER_BITWISE_AND = 8;    // &
Blockly.Arduino.ORDER_BITWISE_XOR = 9;    // ^
Blockly.Arduino.ORDER_BITWISE_OR = 10;    // |
Blockly.Arduino.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Arduino.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Arduino.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Blockly.Arduino.ORDER_ASSIGNMENT = 14;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Arduino.ORDER_COMMA = 15;         //,
Blockly.Arduino.ORDER_UNARY_NEGATION = 16;  //-
Blockly.Arduino.ORDER_MEMBER = 17;              // . []
Blockly.Arduino.ORDER_FUNCTION_CALL = 18;  // ()
Blockly.Arduino.ORDER_NONE = 99;          // (...)

/*
 * Arduino Board profiles
 *
 */
var profile = {
  common:{
    number_type: ["Number","Byte","Unsigned_Int","Long","Unsigned_Long","Word","Char","Float","Double","Volatile_Int"]
  },
  arduino: {
    description: "Arduino standard-compatible board",
    digital: [["0 - UART","0"],["1 - UART", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8 - I2C", "8"], ["9 - I2C", "9"], ["10 - SPI", "10"], ["11 - SPI", "11"], ["12 - SPI", "12"], ["13 - SPI", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"]],
    grove_digital: [["D2", "2"], ["D3", "3"], ["D4", "4"], ["D5", "5"], ["D6", "6"], ["D7", "7"], ["D8", "8"], ["D10", "10"], ["D11", "11"], ["D12", "12"], ["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"]],
    //analog: [["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"]],
    analog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"]],
    grove_analog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"]],
    pwm: [["0","0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"]],
    serial: 9600,
    tone:[["C:Do","262"],["D:Re","294"],["E:Mi","330"],["F:Fa","349"],["G:So","392"],["A:La","440"],["B:Ti","494"],["C:Do","523"]],
    lcd: [["-","-"],["0","0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]],
    dht:[["DHT11","DHT11"],["DHT21","DHT21"],["DHT22","DHT22"]],
    i2c_matrix_type: [["8x8","8x8matrix"],["16x8","8x16matrix"],["bi_color8x8","BicolorMatrix"]],
    led_backpack_address: [["0x70","0x70"],["0x71","0x71"],["0x72","0x72"],["0x73","0x73"]],
    blynk_merge_index: [["0","0"],["1","1"],["2","2"]],
    shield_bot_sensor: [["1","1"],["2","2"],["3","3"],["4","4"],["5","5"]],
    interrupt:[["2","0"],["3","1"]],
    ir_remote_button:[['Power', 'POWER'],['A', 'A'],['B', 'B'],['C', 'C'],['Up', 'UP'],['Down', 'DOWN'],['Left', 'LEFT'],['Right', 'RIGHT'],['Select', 'SELECT']]
  },
  arduino_mega: {
    description: "Arduino Mega-compatible board",
    //53 digital
    //15 analog
    analog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"], ["A8", "A8"], ["A9", "A9"], ["A10", "A10"], ["A11", "A11"], ["A12", "A12"], ["A13", "A13"], ["A14", "A14"], ["A15", "A15"]]
  }
};
//set default profile to arduino standard-compatible board
profile["default"] = profile["arduino"];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Arduino.init = function(workspace) {
  // Create a dictionary of definitions to be printed before setups.
  Blockly.Arduino.definitions_ = Object.create(null);
  // Create a dictionary of setups to be printed before the code.
  Blockly.Arduino.setups_ = Object.create(null);

  if (!Blockly.Arduino.variableDB_) {
    Blockly.Arduino.variableDB_ =
        new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  } else {
    Blockly.Arduino.variableDB_.reset();
  }

  var defvars = [];
//  var variables = Blockly.Variables.allVariables(workspace);
  var variables = Blockly.Variables.allVariablesAndTypes(workspace);
  var datatype = {Number:'int',Long:'long',Float:'float',Byte:'byte',Boolean:'boolean',Char:'char',String:'String',Array:'int',Volatile_Int:'volatile int',Word:'word',Double:'double',Unsigned_Int:'unsigned int',Unsigned_Long:'unsigned long'};
  for (var x = 0; x < variables.length; x++) {
    if(variables[x][1] == ""){
      defvars[x] = 'int ' + ' ' + variables[x][0] + ';\n';
      //Blockly.Arduino.variableDB_.getName(variables[x],
      //Blockly.Variables.NAME_TYPE) + ';\n';
      Blockly.Arduino.definitions_[variables[x][0]] = defvars[x];
    }else{
      //defvars[x] = 'int ' +
      defvars[x] = datatype[variables[x][1]]
        + ' ' + variables[x][0] + ';\n';
        //Blockly.Arduino.variableDB_.getName(variables[x],
        //Blockly.Variables.NAME_TYPE) + ';\n';
      Blockly.Arduino.definitions_[variables[x][0]] = defvars[x];
    }
  }
  //Blockly.Arduino.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Arduino.finish = function(code) {
  // Indent every line.
  code = '  ' + code.replace(/\n/g, '\n');
  code = code.replace(/\n\s+$/, '\n');
  code = 'void loop() \n{\n' + code + '\n}';

  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Arduino.definitions_) {
    var def = Blockly.Arduino.definitions_[name];
    if (def.match(/^#include/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }

  // Convert the setups dictionary into a list.
  var setups = [];
  for (var name in Blockly.Arduino.setups_) {
    setups.push(Blockly.Arduino.setups_[name]);
  }
  var utc = new Date(new Date().getTime());
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n') + '\n\nvoid setup() \n{\n  '+setups.join('\n  ') + '\n}'+ '\n\n';
  allDefs = allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
  allDefs = '/*\n * Generated using BlocklyDuino:\n *\n * https://github.com/MediaTek-Labs/BlocklyDuino-for-LinkIt\n *\n * Date: ' + utc.toUTCString() + '\n */\n\n' + allDefs;
  return allDefs; //allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Arduino.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Arduino string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Arduino string.
 * @private
 */
Blockly.Arduino.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '\"' + string + '\"';
};

/**
 * Common tasks for generating Arduino from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Arduino code created for this block.
 * @return {string} Arduino code with comments and subsequent blocks added.
 * @private
 */
Blockly.Arduino.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Arduino.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Arduino.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Arduino.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Arduino.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};