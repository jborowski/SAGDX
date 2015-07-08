from PIL import Image

input_data = [("Act-1-Tiles.png", "tile_data.txt"), 
              ("Act-1-BackgroundTiles.png", "bg_data.txt")]

for infile, outfile in input_data:

  bitmap = Image.open(infile)

  data = bitmap.load()

  level_size_x = bitmap.size[0]
  level_size_y = bitmap.size[1]

  formatted_data = []

  for i in range(level_size_y):
    for j in range (level_size_x):
      if data[j, i] != (0, 0, 0, 255):
        formatted_data.extend([2])
      else:
        formatted_data.extend([1])

  outfile = open(outfile, 'w')

  outfile.write("Size:\nX: {0[0]}, Y: {0[1]}\n".format(bitmap.size))
  outfile.write(str(formatted_data))
