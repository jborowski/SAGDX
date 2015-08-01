#!/usr/bin/python

# in order to run this script, install PIL/Pillow module:
# $ pip install pillow

from PIL import Image
import json
import os
import sys

# global variables
TILE_SIZE = 16

source = sys.argv[1]
target = sys.argv[2]

print "Generating level from "+source+" to "+target

# put the input png file and tileset image in the same folder as this script
# provide the input/output data in the form of a list of tuples:
# (input image filename, tileset filename, tileset scripting name)
input_data = [( "foregroundLayer","tileset"),
              ( "backgroundLayer","tileset"),
              ( "collisionLayer","tileset")]

for layer, tiles in input_data:

  bitmap = Image.open(os.path.join(source, layer+".png"))

  level_size_x = bitmap.size[0]
  level_size_y = bitmap.size[1]

  data = bitmap.load()

  formatted_data = []

  tile_ids = {
    # Row 1
    (142,0,172,255): 2,
    (216,255,0,255): 3,
    (155,76,229,255): 4,
    (0,255,132,255): 5,
    (103,111,20,255): 6,
    # Row 2
    (0,255,228,255): 8,
    (201,150,51,255): 9,
    (0,36,255,255): 10,
    (118,147,0,255): 11,
    (0,147,48,255): 12,
    # Row 3
    (255,0,252,255): 14,
    (255,168,0,255): 15,
    (253,134,252,255): 16,
    (102,67,0,255): 17,
    # Row 4
    (77,72,63,255): 19,
    (166,142,102,255): 20,
    (121,77,0,255): 21,
    (184,144,74,255): 22
  }

  for i in range(level_size_y):
    for j in range (level_size_x):
      # compare pixel color with reference and output GID represented by that color
      if data[j, i] in tile_ids:
        formatted_data.extend([ tile_ids[data[j,i]] ])
      elif data[j, i][0] > 0 or data[j, i][1] > 0:
        formatted_data.extend([1])
      else:
        formatted_data.extend([0])

  tileset = Image.open(os.path.join(source, tiles+".png"))

  tileset_size_x = tileset.size[0]
  tileset_size_y = tileset.size[1]

  # output JSON format
  output_data = {
    "height": level_size_y,
    "layers":[{
      "data": formatted_data,
      "height": level_size_y,
      "name": layer,
      "opacity": 1,
      "type": "tilelayer",
      "visible": "true",
      "width": level_size_x,
      "x": 0,
      "y": 0,
    }],
    "orientation": "orthogonal",
    "properties": {},
    "tileheight": TILE_SIZE,
    "tilesets":[{
      "firstgid": 1,
      "image": tiles+".png",
      "imageheight": tileset_size_y,
      "imagewidth": tileset_size_x,
      "margin": 0,
      "name": tiles,
      "properties": {},
      "spacing": 0,
      "tileheight": TILE_SIZE,
      "tilewidth": TILE_SIZE
    }],
    "tilewidth": TILE_SIZE,
    "version": 1,
    "width": level_size_x
  }

  outfile = open(os.path.join(target, "data", source, layer+".json"), 'w')

  json_dump = json.dumps(output_data, sort_keys=True, indent=2)

  outfile.write(json_dump)

  outfile.close()
