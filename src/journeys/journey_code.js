const add_item_code = `
branch bloomFilterContains (present) true {
    print "Item '%item%' is already in the Bloom Filter";
    execute waitForUser;
    execute return (return);
}

print "# Adding an item to the Bloom Filter";
print "To add an item to the Bloom Filter, we will calculate multiple hash values for the item and set the corresponding bits in the bit array";
print "Let's go through the process step-by-step";
execute waitForUser;
print "First, we will calculate the hash values using our hash functions for the item '%item%'";

execute hash1 (p1);
print "- Hash 1: %p1%";
execute waitForUser;

print "Now we set the bit at position %p1% in the bit array to 1";
define position=p1;
execute setBit;
execute waitForUser;


print "Lets do the same for the next hash function";
execute hash2 (p2);
print "- Hash 2: %p2%";
execute waitForUser;
print "Now we set the bit at position %p2% in the bit array to 1";
define position=p2;
execute setBit;
execute waitForUser;

print "Finally, we will calculate the hash value using our third hash function";
execute hash3 (p3);
print "- Hash 3: %p3%";
print "Now we set the bit at position %p3% in the bit array to 1";
define position=p3;
execute setBit;

execute waitForUser;

print "All done! The item '%item%' has been added to the Bloom Filter!";
print "Check the new false positive rate, you can see it in the stats panel";
`

const check_item_code = `
print "To check if the item '%item%' is in the Bloom Filter, we will calculate its hashes";
execute waitForUser;

execute hash1 (p1);

execute hash2 (p2);

execute hash3 (p3);

print "We have calculated the hashes:";
print "- hash1: %p1%";
print "- hash2: %p2%";
print "- hash3: %p3%";
execute waitForUser;

print "Now, we will check the bits at these positions in the bit array.";
execute waitForUser;

define position=p1;
execute getBit (bit);
define h1b=bit;

define position=p2;
execute getBit (bit);
define h2b=bit;

define position=p3;
execute getBit (bit);
define h3b=bit;

print "Let's check the bit at each position";
execute waitForUser;

define position=p1;
execute checkBit;
print "- At position %p1%: it is %h1b%";
execute waitForUser;

define position=p2;
execute checkBit;
print "- At position %p2%: it is %h2b%";
execute waitForUser;

define position=p3;
execute checkBit;
print "- At position %p3%: it is %h3b%";
execute waitForUser;

define bits=[h1b, h2b, h3b];
branch allTrue (all) true {
    print "All the bits at positions %p1%, %p2%, and %p3% are set to true!";
    print "The item '%item%' is possibly in the Bloom Filter.";
    execute waitForUser;

    branch bloomFilterContains (contains) true {
        print "And in fact, the item '%item%' is present in the Bloom Filter (no false positive here!)."
        execute waitForUser;
        execute return (return); 
    }


    branch bloomFilterContains (contains) false {
        print "But let's check the bits again...";
        print "%p1%: %h1b%";
        print "%p2%: %h2b%";
        print "%p3%: %h3b%";
        print "Hmm, seems like a false positive! The item '%item%' is not actually in the Bloom Filter (false positives are possible!).";
        execute waitForUser;
        execute return (return);
    }
}

branch allTrue (all) false {
    print "At least one of the bits at positions %p1%, %p2%, or %p3% is set to false.";
    print "The item '%item%' is definitely not in the Bloom Filter (no false negatives here!).";
    execute waitForUser;
    execute return (return);
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