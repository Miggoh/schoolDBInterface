const card = document.getElementById('card');
const swapper = document.getElementById('swapper');
                
swapper.addEventListener('click', function(){ card.innerHTML = 
                `<h5 class="card-title text-center">Welcome Back!</h5>
                  <form class="form-signin" method="POST" action="/login">
                    <div class="form-label-group">
                      <input type="text" id="inputUserame" class="form-control" placeholder="Username" name="username" required autofocus>
                      <label for="inputUserame">Username</label>
                    </div>
                    
                    <hr>
      
                    <div class="form-label-group">
                      <input type="password" id="inputPassword" class="form-control" placeholder="Password" name="password" required>
                      <label for="inputPassword">Password</label>
                    </div>
                    <button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Login</button>
                  </form>`});