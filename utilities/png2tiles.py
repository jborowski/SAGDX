#!/usr/bin/python

# in order to run this script, install PIL/Pillow module:
# $ pip install pillow

from PIL import Image
import json
import sys

# global variables
TILE_SIZE = 16

source = sys.argv[1]
target = sys.argv[2]

print "Generating level from "+source+" to "+target

# put the input png file and tileset image in the same folder as this script
# provide the input/output data in the form of a list of tuples:
# (input image filename, tileset filename, tileset scripting name)
input_data = [( "foregroundLayer","foregroundTileset")]#,
             # ( "backgroundLayer","backgroundTileset"),
             # ("collisionLayer","collisionTileset")]

for layer, tiles in input_data:

  bitmap = Image.open(source+layer+".png")

  level_size_x = bitmap.size[0]
  level_size_y = bitmap.size[1]

  data = bitmap.load()

  formatted_data = []

  for i in range(level_size_y):
    for j in range (level_size_x):
      # compare pixel color with reference and output GID represented by that color
      if data[j, i] == (255, 0, 0, 255):
        formatted_data.extend([3])
      elif data[j, i] == (0, 255, 0, 255):
        formatted_data.extend([1])
      elif data[j, i] == (0, 0, 255, 255):
        formatted_data.extend([4])
      elif data[j, i] == (167, 118, 24, 255):
        formatted_data.extend([8])
      else:
        formatted_data.extend([0])

  tileset = Image.open(source+tiles+".png")

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

  outfile = open(target+"data/"+layer+".json", 'w')

  json_dump = json.dumps(output_data, sort_keys=True, indent=2)

  outfile.write(json_dump)

  outfile.close()
