package session

import (
	"sync"
	"time"
)

const refreshGracePeriod = 5 * time.Second

type RefreshResult struct {
	RefreshToken string
	AccessToken  string
}

type refreshEntry struct {
	result    RefreshResult
	rotatedAt time.Time
}

type RefreshCoordinator struct {
	mu      sync.Mutex
	entries map[string]refreshEntry
	locks   map[string]*sync.Mutex
}

func NewRefreshCoordinator() *RefreshCoordinator {
	return &RefreshCoordinator{
		entries: make(map[string]refreshEntry),
		locks:   make(map[string]*sync.Mutex),
	}
}
func (c *RefreshCoordinator) Lock(tokenHash string) func() {
	c.mu.Lock()
	lock, exists := c.locks[tokenHash]
	if !exists {
		lock = &sync.Mutex{}
		c.locks[tokenHash] = lock

	}
	c.mu.Unlock()
	lock.Lock()
	return lock.Unlock
}

func (c *RefreshCoordinator) Get(
	tokenHash string,
) (RefreshResult, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	entry, exists := c.entries[tokenHash]
	if !exists {
		return RefreshResult{}, false
	}
	if time.Since(entry.rotatedAt) > refreshGracePeriod {
		delete(c.entries, tokenHash)
		return RefreshResult{}, false
	}
	return entry.result, true
}

func (c *RefreshCoordinator) Set(tokenHash string, result RefreshResult) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[tokenHash] = refreshEntry{
		result:    result,
		rotatedAt: time.Now(),
	}
}
