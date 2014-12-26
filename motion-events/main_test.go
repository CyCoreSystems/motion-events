package main

import "fmt"

// Clean is a common utility function
// to clean up testing keys
func Clean(e Event) {
	var err error
	rc := rp.Get()
	defer rc.Close()

	_, err = rc.Do("DEL", e.EnumKey())
	if err != nil {
		fmt.Println("Failed to delete enum key:", err)
	}
	_, err = rc.Do("DEL", e.TimeKey())
	if err != nil {
		fmt.Println("Failed to delete time key:", err)
	}
	_, err = rc.Do("DEL", e.DataKey())
	if err != nil {
		fmt.Println("Failed to delete data key:", err)
	}
}
