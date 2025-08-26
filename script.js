   //THINGS TO IMPLEMENT:
   /*
   1) Changed weather implementation - use a weather API to get real-time weather data based on user location.
   2) Color harmony checker - implement a function to check if selected colors are complementary or clash.
   3) Usage tracking and recommendations - track how often each item is worn and suggest items that haven't been worn recently.
    4) Enhanced outfit generation with seasonal considerations - ensure outfits are appropriate for the current season.
    5)
   */


    //SO THIS IS A LITTLE UGLY BUT IT WORKS FOR NOW
   
   
   
   // Wardrobe data storage
        let wardrobe = [];
        let nextId = 1;

        // Color coordination rules
        const colorCombinations = {
            red: ['white', 'black', 'gray', 'blue'],
            blue: ['white', 'gray', 'red', 'yellow'],
            green: ['white', 'brown', 'gray', 'black'],
            yellow: ['blue', 'gray', 'white', 'black'],
            black: ['white', 'red', 'pink', 'yellow'],
            white: ['black', 'blue', 'red', 'green'],
            gray: ['white', 'black', 'red', 'blue'],
            brown: ['white', 'green', 'yellow', 'orange'],
            pink: ['white', 'black', 'gray', 'green'],
            purple: ['white', 'yellow', 'gray', 'black'],
            orange: ['blue', 'white', 'brown', 'black']
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadWardrobe();
            setupEventListeners();
            updateStats();
        });

        function setupEventListeners() {
            // File upload
            const uploadSection = document.getElementById('uploadSection');
            const fileInput = document.getElementById('fileInput');

            uploadSection.addEventListener('click', () => fileInput.click());
            uploadSection.addEventListener('dragover', handleDragOver);
            uploadSection.addEventListener('drop', handleDrop);
            uploadSection.addEventListener('dragleave', handleDragLeave);

            fileInput.addEventListener('change', handleFileSelect);

            // Form submission
            document.getElementById('clothingForm').addEventListener('submit', addClothingItem);

            // Filters
            document.getElementById('categoryFilter').addEventListener('change', filterWardrobe);
            document.getElementById('colorFilter').addEventListener('change', filterWardrobe);
            document.getElementById('seasonFilter').addEventListener('change', filterWardrobe);
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('dragover');
        }

        function handleDragLeave(e) {
            e.currentTarget.classList.remove('dragover');
        }

        function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles(files);
        }

        function handleFileSelect(e) {
            handleFiles(e.target.files);
        }

        function handleFiles(files) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Store the image data - in a real app, you'd upload to a server
                        const imageData = e.target.result;
                        // Auto-fill the form if it's empty
                        if (!document.getElementById('itemName').value) {
                            document.getElementById('itemName').value = file.name.split('.')[0];
                        }
                        // Store image for the next item to be added
                        window.pendingImage = imageData;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        function addClothingItem(e) {
            e.preventDefault();
            
            const formData = {
                id: nextId++,
                name: document.getElementById('itemName').value,
                category: document.getElementById('category').value,
                color: document.getElementById('color').value,
                season: document.getElementById('season').value,
                image: window.pendingImage || null,
                dateAdded: new Date(),
                lastWorn: null,
                wornCount: 0
            };

            if (!formData.name || !formData.category || !formData.color || !formData.season) {
                alert('Please fill in all fields');
                return;
            }

            wardrobe.push(formData);
            saveWardrobe();
            displayWardrobe();
            updateStats();
            
            // Reset form
            document.getElementById('clothingForm').reset();
            window.pendingImage = null;
        }

        function displayWardrobe(items = wardrobe) {
            const grid = document.getElementById('wardrobeGrid');
            grid.innerHTML = '';

            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'clothing-item';
                
                // Check if worn recently (within last 7 days)
                const isRecentlyWorn = item.lastWorn && 
                    (new Date() - new Date(item.lastWorn)) < (7 * 24 * 60 * 60 * 1000);
                
                if (isRecentlyWorn) {
                    itemElement.classList.add('worn-recently');
                }

                itemElement.innerHTML = `
                    <div class="clothing-image">
                        ${item.image ? 
                            `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">` : 
                            '👕'
                        }
                    </div>
                    <div class="clothing-info">
                        <strong>${item.name}</strong><br>
                        Category: ${item.category}<br>
                        Color: ${item.color}<br>
                        Season: ${item.season}
                    </div>
                    <div class="tags">
                        <span class="tag">${item.category}</span>
                        <span class="tag">${item.color}</span>
                        <span class="tag">${item.season}</span>
                    </div>
                    <button class="btn" onclick="markAsWorn(${item.id})" style="margin: 10px 5px 0 0; padding: 8px 15px; font-size: 0.8rem;">
                        Mark as Worn
                    </button>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
                `;

                grid.appendChild(itemElement);
            });
        }

        function filterWardrobe() {
            const categoryFilter = document.getElementById('categoryFilter').value;
            const colorFilter = document.getElementById('colorFilter').value;
            const seasonFilter = document.getElementById('seasonFilter').value;

            let filteredItems = wardrobe.filter(item => {
                return (!categoryFilter || item.category === categoryFilter) &&
                       (!colorFilter || item.color === colorFilter) &&
                       (!seasonFilter || item.season === seasonFilter || item.season === 'all');
            });

            displayWardrobe(filteredItems);
        }

        function markAsWorn(id) {
            const item = wardrobe.find(item => item.id === id);
            if (item) {
                item.lastWorn = new Date();
                item.wornCount++;
                saveWardrobe();
                displayWardrobe();
                updateStats();
            }
        }

        function deleteItem(id) {
            if (confirm('Are you sure you want to delete this item?')) {
                wardrobe = wardrobe.filter(item => item.id !== id);
                saveWardrobe();
                displayWardrobe();
                updateStats();
            }
        }

        function updateStats() {
            document.getElementById('totalItems').textContent = wardrobe.length;
            
            const recentlyWorn = wardrobe.filter(item => 
                item.lastWorn && (new Date() - new Date(item.lastWorn)) < (7 * 24 * 60 * 60 * 1000)
            ).length;
            
            document.getElementById('recentlyWorn').textContent = recentlyWorn;
        }

        function generateOutfitSuggestion() {
            const occasion = document.getElementById('occasion').value;
            const availableItems = wardrobe.filter(item => {
                // Don't suggest recently worn items
                const recentlyWorn = item.lastWorn && 
                    (new Date() - new Date(item.lastWorn)) < (3 * 24 * 60 * 60 * 1000);
                return !recentlyWorn;
            });

            if (availableItems.length < 2) {
                document.getElementById('outfitSuggestions').innerHTML = 
                    '<p>Add more items to your wardrobe for better suggestions!</p>';
                return;
            }

            // Simple outfit generation logic
            const tops = availableItems.filter(item => item.category === 'tops');
            const bottoms = availableItems.filter(item => item.category === 'bottoms');
            const outerwear = availableItems.filter(item => item.category === 'outerwear');
            const shoes = availableItems.filter(item => item.category === 'shoes');

            let outfit = [];
            
            // Pick a top
            if (tops.length > 0) {
                const randomTop = tops[Math.floor(Math.random() * tops.length)];
                outfit.push(randomTop);
                
                // Pick matching bottom
                if (bottoms.length > 0) {
                    const matchingBottoms = bottoms.filter(bottom => 
                        colorCombinations[randomTop.color] && 
                        colorCombinations[randomTop.color].includes(bottom.color)
                    );
                    
                    const bottomsToChooseFrom = matchingBottoms.length > 0 ? matchingBottoms : bottoms;
                    const randomBottom = bottomsToChooseFrom[Math.floor(Math.random() * bottomsToChooseFrom.length)];
                    outfit.push(randomBottom);
                }
                
                // Add outerwear for work/formal occasions
                if ((occasion === 'work' || occasion === 'formal') && outerwear.length > 0) {
                    const randomOuterwear = outerwear[Math.floor(Math.random() * outerwear.length)];
                    outfit.push(randomOuterwear);
                }
                
                // Add shoes
                if (shoes.length > 0) {
                    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
                    outfit.push(randomShoes);
                }
            }

            // Display suggestion
            const suggestionHTML = `
                <div class="outfit-suggestion">
                    <h3>✨ Perfect for ${occasion}!</h3>
                    <div class="outfit-items">
                        ${outfit.map(item => 
                            `<div class="outfit-item">${item.name}<br><small>${item.category}</small></div>`
                        ).join('')}
                    </div>
                    <p style="margin-top: 15px; font-size: 0.9rem;">
                        💡 This combination uses complementary colors for a harmonious look!
                    </p>
                </div>
            `;

            document.getElementById('outfitSuggestions').innerHTML = suggestionHTML;
        }

        function saveWardrobe() {
            // Note: In a real app, this would save to a server
            // For demo purposes, we're using memory storage only
        }

        function loadWardrobe() {
            // Note: In a real app, this would load from a server
            // For demo purposes, we start with an empty wardrobe
            displayWardrobe();
        }

        // Add some sample data for demonstration
        window.addSampleData = function() {
            const sampleItems = [
                {
                    id: nextId++,
                    name: "Blue Denim Jacket",
                    category: "outerwear",
                    color: "blue",
                    season: "spring",
                    image: null,
                    dateAdded: new Date(),
                    lastWorn: null,
                    wornCount: 0
                },
                {
                    id: nextId++,
                    name: "White Cotton T-Shirt",
                    category: "tops",
                    color: "white",
                    season: "all",
                    image: null,
                    dateAdded: new Date(),
                    lastWorn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    wornCount: 3
                },
                {
                    id: nextId++,
                    name: "Black Skinny Jeans",
                    category: "bottoms",
                    color: "black",
                    season: "all",
                    image: null,
                    dateAdded: new Date(),
                    lastWorn: null,
                    wornCount: 0
                }
            ];
            
            wardrobe.push(...sampleItems);
            displayWardrobe();
            updateStats();
        };

        // Add sample data button (for demo purposes)
        setTimeout(() => {
            const demoButton = document.createElement('button');
            demoButton.textContent = '🎭 Add Sample Items (Demo)';
            demoButton.className = 'btn';
            demoButton.style.marginTop = '20px';
            demoButton.onclick = addSampleData;
            document.querySelector('.panel').appendChild(demoButton);
        }, 1000);

        // Advanced outfit suggestions based on weather and occasion
        function getWeatherBasedSuggestions(temperature, condition) {
            let suggestions = [];
            
            if (temperature < 50) {
                suggestions = wardrobe.filter(item => 
                    item.category === 'outerwear' || 
                    (item.season === 'winter' || item.season === 'all')
                );
            } else if (temperature > 80) {
                suggestions = wardrobe.filter(item => 
                    item.category === 'tops' && 
                    (item.season === 'summer' || item.season === 'all') &&
                    ['white', 'yellow', 'blue'].includes(item.color)
                );
            }
            
            return suggestions;
        }

        // Color harmony checker
        function checkColorHarmony(color1, color2) {
            const complementary = {
                'red': ['green', 'white', 'black'],
                'blue': ['orange', 'yellow', 'white'],
                'green': ['red', 'brown', 'white'],
                'yellow': ['purple', 'blue', 'black'],
                'purple': ['yellow', 'green', 'white'],
                'orange': ['blue', 'purple', 'brown']
            };
            
            return complementary[color1]?.includes(color2) || 
                   complementary[color2]?.includes(color1) ||
                   color1 === color2;
        }

        // Usage tracking and recommendations
        function getUsageRecommendations() {
            const leastWorn = wardrobe
                .filter(item => item.wornCount < 2)
                .sort((a, b) => a.wornCount - b.wornCount)
                .slice(0, 3);
            
            if (leastWorn.length > 0) {
                const recommendation = document.createElement('div');
                recommendation.className = 'outfit-suggestion';
                recommendation.style.background = 'linear-gradient(135deg, #ff9a9e, #fecfef)';
                recommendation.innerHTML = `
                    <h3>💡 Items to Wear More</h3>
                    <p>These items haven't been worn much lately:</p>
                    <div class="outfit-items">
                        ${leastWorn.map(item => 
                            `<div class="outfit-item">${item.name}</div>`
                        ).join('')}
                    </div>
                `;
                document.getElementById('outfitSuggestions').appendChild(recommendation);
            }
        }

        // Enhanced outfit generation with seasonal considerations
        function generateSeasonalOutfit() {
            const currentMonth = new Date().getMonth();
            let currentSeason;
            
            if (currentMonth >= 2 && currentMonth <= 4) currentSeason = 'spring';
            else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'summer';
            else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'fall';
            else currentSeason = 'winter';
            
            const seasonalItems = wardrobe.filter(item => 
                item.season === currentSeason || item.season === 'all'
            );
            
            return seasonalItems;
        }

        // Laundry reminder system
        function checkLaundryReminders() {
            const frequentlyWorn = wardrobe.filter(item => 
                item.lastWorn && 
                (new Date() - new Date(item.lastWorn)) < (1 * 24 * 60 * 60 * 1000) && // worn yesterday
                item.wornCount > 5
            );
            
            if (frequentlyWorn.length > 0) {
                const reminder = document.createElement('div');
                reminder.style.background = 'linear-gradient(135deg, #ffecd2, #fcb69f)';
                reminder.style.padding = '15px';
                reminder.style.borderRadius = '10px';
                reminder.style.marginBottom = '20px';
                reminder.style.textAlign = 'center';
                reminder.innerHTML = `
                    <h4>🧺 Laundry Reminder</h4>
                    <p>Some frequently worn items might need washing!</p>
                `;
                document.getElementById('outfitSuggestions').insertBefore(
                    reminder, 
                    document.getElementById('outfitSuggestions').firstChild
                );
            }
        }

        // Initialize additional features
        setInterval(() => {
            checkLaundryReminders();
            if (Math.random() < 0.3) { // 30% chance to show usage recommendations
                getUsageRecommendations();
            }
        }, 30000); // Check every 30 seconds for demo purposes

        // Export wardrobe data
        window.exportWardrobe = function() {
            const dataStr = JSON.stringify(wardrobe, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'my_wardrobe.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        // Search functionality
        window.searchWardrobe = function(searchTerm) {
            const results = wardrobe.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.color.toLowerCase().includes(searchTerm.toLowerCase())
            );
            displayWardrobe(results);
        };

        // Outfit planning for the week
        window.planWeeklyOutfits = function() {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const weekPlan = document.createElement('div');
            weekPlan.innerHTML = '<h3>📅 Weekly Outfit Plan</h3>';
            
            days.forEach(day => {
                const dayOutfit = generateRandomOutfit();
                const dayElement = document.createElement('div');
                dayElement.style.marginBottom = '15px';
                dayElement.style.padding = '10px';
                dayElement.style.background = 'rgba(255,255,255,0.1)';
                dayElement.style.borderRadius = '10px';
                dayElement.innerHTML = `
                    <strong>${day}:</strong><br>
                    ${dayOutfit.map(item => item.name).join(', ')}
                `;
                weekPlan.appendChild(dayElement);
            });
            
            document.getElementById('outfitSuggestions').innerHTML = '';
            document.getElementById('outfitSuggestions').appendChild(weekPlan);
        };

        function generateRandomOutfit() {
            const tops = wardrobe.filter(item => item.category === 'tops');
            const bottoms = wardrobe.filter(item => item.category === 'bottoms');
            
            const outfit = [];
            if (tops.length > 0) outfit.push(tops[Math.floor(Math.random() * tops.length)]);
            if (bottoms.length > 0) outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
            
            return outfit;
        }