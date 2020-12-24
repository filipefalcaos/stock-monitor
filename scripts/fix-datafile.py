import json
import sys


# Renames a key from a dictionary
def rename_key(dictionary, old_key, new_key):
    if old_key in dictionary:
        dictionary[new_key] = dictionary.pop(old_key)


# Converts the value of a key to a number
def to_num(dictionary, key, integer=True):
    if key in dictionary:
        dictionary[key] = (int(dictionary[key]) if integer else float(dictionary[key]))


# Args parsing
nargs = len(sys.argv)
if nargs == 2:
    datafile_path = sys.argv[1]
else:
    sys.exit('Incorret number of arguments provided.\nUsage: python3 fix-datafile <path>')

print('Datafile: ' + datafile_path)
with open(datafile_path) as f:
    data = json.load(f)

# Fix datafile
print('Applying fixes...', end=' ')
rename_key(data, 'last_portfolio', 'lastPortfolio')

for portfolio in data['portfolios']:
    rename_key(portfolio, 'created_at', 'createdAt')

    for dividend in portfolio['dividendsReceived']:
        rename_key(dividend, 'stock', 'asset')
        rename_key(dividend, 'type', 'typeTxt')
    
    for position in portfolio['positions']:
        rename_key(position, 'created_at', 'createdAt')
        rename_key(position, 'closed_at', 'closedAt')
        rename_key(position, 'initial_price', 'initialPrice')
        rename_key(position, 'current_price', 'currentPrice')
        rename_key(position, 'close_price', 'closePrice')
        rename_key(position, 'asset', 'assetType')
        rename_key(position, 'stock', 'asset')
        rename_key(position, 'type', 'direction')

        to_num(position, 'amount')
        to_num(position, 'closePrice', integer=False)
        to_num(position, 'currentPrice', integer=False)

# Persist fixes
with open(datafile_path, 'w') as f:
    json.dump(data, f, indent=2, sort_keys=True)

print('DONE')
