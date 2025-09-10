const add_item_code = `
check bloomFilterContains (item, expectedResult) true {
    print (item) "Item '|item|' is already in the Bloom Filter";
    execute waitForUser;
    execute return;
}

print "# Adding an item to the Bloom Filter";
print "To add an item to the Bloom Filter, we will calculate multiple hash values for the item and set the corresponding bits in the bit array";
print "Let's go through the process step-by-step";
execute waitForUser;
print (item) "First, we will calculate the hash values using our hash functions for the item '|item|'";

execute hash1 (item);
print (position) "- Hash 1: |position|";
execute waitForUser;

print (position) "Now we set the bit at position |position| in the bit array to 1";
execute setBit (position, item);
execute waitForUser;


print "Lets do the same for the next hash function";
execute hash2 (item);
print (position) "- Hash 2: |position|";
execute waitForUser;
print (position) "Now we set the bit at position |position| in the bit array to 1";
execute setBit (position, item);
execute waitForUser;

print "Finally, we will calculate the hash value using our third hash function";
execute hash3 (item);
print (position) "- Hash 3: |position|";
print (position) "Now we set the bit at position |position| in the bit array to 1";
execute setBit (position, item);

execute waitForUser;

print (item) "All done! The item '|item|' has been added to the Bloom Filter!";
print "I already updated the false positive rate, you can see it in the stats panel";
`

const check_item_code = `
print (item) "To check if the item '|item|' is in the Bloom Filter, we will calculate its hashes";
execute waitForUser;

execute hash1 (item);
define hash1=position;

execute hash2 (item);
define hash2=position;

execute hash3 (item);
define hash3=position;

print "We have calculated the hashes:";
print "- hash1: |hash1|";
print "- hash2: |hash2|";
print "- hash3: |hash3|";
execute waitForUser;

print "Now, we will check the bits at these positions in the bit array.";
execute waitForUser;

define position=hash1;
execute getBit (position);
define h1b=bit;

define position=hash2;
execute getBit (position);
define h2b=bit;

define position=hash3;
execute getBit (position);
define h3b=bit;

print "Let's check the bit at each position";
execute waitForUser;

execute setBit (hash1, h1b, item);
print "- Position |hash1|: it is |h1b|";
execute waitForUser;

execute setBit (hash2, h2b, item);
print "- Position |hash2|: it is |h2b|";
execute waitForUser;

execute setBit (hash3, h3b, item);
print "- Position |hash3|: it is |h3b|";
execute waitForUser;

define bits=[h1b, h2b, h3b];
check allTrue (bits) true {
    print "All the bits at positions |hash1|, |hash2|, and |hash3| are set to true!";
    print "The item '|item|' is possibly in the Bloom Filter.";
    execute waitForUser;

    check bloomFilterContains (item) true {
        print "And in fact, the item '|item|' is present in the Bloom Filter (no false positive here!)."
        execute waitForUser;
        execute return;
    }
}

`;

const greetings_code = `
print "cat README.md";
print "# Welcome to the Bloom Filter Algorithm Visualizer";
print "You can learn about the Bloom Filter data structure and how it works by following the execution step-by-step";
print "Use the Add and Check buttons to see how items are added and checked in the Bloom Filter";
print "Set the number of bits and hash functions to see how they affect the performance";
print "Enjoy learning about Bloom Filters!";
`;

export { add_item_code, greetings_code, check_item_code };