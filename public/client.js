const card = document.getElementById('card');
const swapper = document.getElementById('swapper');
                
swapper.addEventListener('click', function(){ card.innerHTML = 
                `<h5 class="card-title text-center">Welcome back!</h5>
                  <form class="form-signin" method="POST" action="/login">
                    <div class="form-label-group">
                      <input type="text" id="inputUserame" class="form-control" placeholder="Username" autocomplete="username" name="username" required autofocus>
                      <label for="inputUserame"><i class="fas fa-user"></i> Username</label>
                    </div>
                    
                    <hr>
      
                    <div class="form-label-group">
                      <input type="password" id="inputPassword" class="form-control" placeholder="Password" autocomplete="current-password" name="password" required>
                      <label for="inputPassword"><i class="fas fa-key"></i> Password</label>
                    </div>
                    <button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
                  </form>`});