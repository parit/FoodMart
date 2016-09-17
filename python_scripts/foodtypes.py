import json
import urllib2
import itertools 
import operator


def food_type(obj):

	apikey = "P2S1DkvEkbS9zN2Q5e2s7Qf3EtkiBKqN14pSFgft"
	#obj = "whole wheat flour"


	print(obj)
	obj = obj.replace(" ", "%20")
	url = "http://api.nal.usda.gov/ndb/search/?format=json&q="+obj+"&sort=n&max=25&offset=0&ds=Standard%20Reference&api_key="+apikey

	data = json.load(urllib2.urlopen(url))


	try:
		items = data['list']['item']
	except:
		print("ERROR: Item not found!")
		items = []
		return

	mgroups = []

	for item in items:

		mgroups.append(item['group'])
		#print(item['group'])
	#print("-----")
	#print(data['list']['verticies'])


	def most_common(L):
	  # get an iterable of (item, iterable) pairs
	  SL = sorted((x, i) for i, x in enumerate(L))
	  # print 'SL:', SL
	  groups = itertools.groupby(SL, key=operator.itemgetter(0))
	  # auxiliary function to get "quality" for an item
	  def _auxfun(g):
	    item, iterable = g
	    count = 0
	    min_index = len(L)
	    for _, where in iterable:
	      count += 1
	      min_index = min(min_index, where)
	    # print 'item %r, count %r, minind %r' % (item, count, min_index)
	    return count, -min_index
	  # pick the highest-count/earliest item
	  return max(groups, key=_auxfun)[0]

	print(most_common(mgroups))
	return most_common(mgroups)

if __name__ == "__main__":
	food_type("cucumber")
