$(document).ready(function() {
    let cart = [];
    let total = 0;
    let isLoggedIn = false; // Status login pengguna
    let loggedInUser = null; // Nama pengguna yang sedang login
    const apiKey = 'cc0e3d3915c3052720099a41d55a27e7'; // API Key Paydisini

        // Fungsi untuk menangani login Google
        function handleCredentialResponse(response) {
            const data = jwt_decode(response.credential);
            console.log(data); // Menampilkan informasi user dari Google di console
    
            // Simpan informasi user ke localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', data.name);
    
            // Tampilkan nama user di halaman
            $('#user-info').text(`Halo, ${data.name}`);
            $('#login-modal').hide(); // Menutup modal login
            $('#user-modal').show();  // Menampilkan modal user
        }
    
        // Fungsi untuk cek status login
        function checkLoginStatus() {
            isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedIn) {
                const loggedInUser = localStorage.getItem('loggedInUser');
                $('#user-info').text(`Halo, ${loggedInUser}`);
                return true;
            }
            return false;
        }
    // Fungsi untuk menyimpan keranjang ke localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Fungsi untuk memuat keranjang dari localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartIcon();
            updateTotalPrice();
        }
    }

    // Update jumlah item di ikon keranjang
    function updateCartIcon() {
        if (cart.length > 0) {
            $('#cart-icon span').text(cart.length); // Tampilkan jumlah item
        } else {
            $('#cart-icon span').text('0'); // Tampilkan 0 jika keranjang kosong
        }
    }

    // Update total harga
    function updateTotalPrice() {
        total = cart.reduce((acc, product) => acc + product.price, 0);
        $('#total-price').text(`Total: Rp ${total}`);
    }

    // Cek status login dari localStorage
    function checkLoginStatus() {
        isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        return isLoggedIn;
    }

    // Load cart from localStorage
    loadCart();

    // Tambah ke keranjang
    $('.add-to-cart-btn').click(function() {
        const productName = $(this).data('product');
        const productPrice = parseInt($(this).siblings('.price').text().replace('Rp ', '').replace('.', ''));
        const product = { name: productName, price: productPrice };
        
        cart.push(product);
        alert(`${product.name} telah ditambahkan ke keranjang.`);
        
        // Update ikon keranjang
        updateCartIcon();
        updateTotalPrice();
        saveCart(); // Simpan ke localStorage
    });

    // Tampilkan daftar produk di keranjang saat ikon keranjang diklik
    $('#cart-icon').click(function() {
        let cartContent = '';
        cart.forEach(product => {
            cartContent += `<li>${product.name} - Rp ${product.price}</li>`;
        });
        
        if (cart.length === 0) {
            cartContent = '<li>Keranjang kosong</li>';
        }
        
        $('#cart-items').html(cartContent);
        updateTotalPrice();
        $('#cart-modal').show(); // Tampilkan modal keranjang
    });

    // Tutup modal keranjang
    $('.close-cart').click(function() {
        $('#cart-modal').hide();
    });

    // Fungsi untuk login di modal
    $('#login-form').submit(function(event) {
        event.preventDefault();

        // Ambil nilai input dari modal login
        const inputUsername = $('#login-username').val();
        const inputPassword = $('#login-password').val();

        // Ambil username dan password dari localStorage
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');

        // Cek apakah username dan password sesuai
        if (inputUsername === storedUsername && inputPassword === storedPassword) {
            alert('Login berhasil!');
            isLoggedIn = true; // Set status login menjadi true
            localStorage.setItem('isLoggedIn', 'true'); // Simpan status login
            localStorage.setItem('loggedInUser', inputUsername); // Simpan informasi user
            $('#login-modal').hide(); // Tutup modal login setelah login berhasil
        } else {
            alert('Username atau password salah.');
        }
    });

    // Fungsi untuk logout
    $('#logout-btn').click(function() {
        cart = [];
        saveCart();
        isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('cart'); // Hapus keranjang dari localStorage
        updateCartIcon(); // Perbarui ikon keranjang
        alert('Anda telah logout.');
        window.location.href = 'index.html'; // Ganti '/' dengan URL halaman utama Anda jika berbeda
    });

    // Fungsi untuk checkout dan integrasi dengan Paydisini
    $('#checkout-btn').click(function() {
        if (!checkLoginStatus()) {
            $('#login-modal').show();
        } else if ($('input[name="payment-method"]:checked').val() === 'paydisini') {
            if (cart.length > 0) {
                const orderData = {
                    total: total, // Total price
                    products: cart, // Products in the cart
                    customer: {
                        name: $('#name').val(),
                        email: $('#email').val(),
                        address: $('#address').val()
                    }
                };
                
                // AJAX call to Paydisini API with API key in headers
                $.ajax({
                    url: 'https://niki-niku.com',
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`, // Menambahkan API Key
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(orderData),
                    success: function(response) {
                        alert('Pembayaran berhasil diproses melalui Paydisini!');
                        cart = [];
                        saveCart();
                        updateCartIcon();
                        $('#cart-modal').hide();
                    },
                    error: function(error) {
                        alert('Terjadi kesalahan saat memproses pembayaran.');
                    }
                });
            } else {
                alert('Keranjang kosong.');
            }
        }
    });

    // Fungsi untuk checkout
    $('#checkout-btn').click(function() {
        if (!checkLoginStatus()) {
            // Jika belum login, tampilkan modal login
            $('#login-modal').show();
        } else {
            if (cart.length > 0) {
                alert(`Pembelian berhasil dengan total Rp ${total}`);
                cart = []; // Kosongkan keranjang setelah pembelian
                saveCart(); // Simpan keranjang kosong ke localStorage
                updateCartIcon();
                $('#cart-modal').hide();
            } else {
                alert('Keranjang kosong.');
            }
        }
    });

    // Fungsi untuk menampilkan informasi user saat ikon user diklik
    $('#user-icon').click(function() {
        if (!checkLoginStatus()) {
            // Jika belum login, arahkan ke halaman login
            $('#login-modal').show();
        } else {
            const loggedInUser = localStorage.getItem('loggedInUser'); // Ambil informasi user dari localStorage
            if (loggedInUser) {
                $('#user-info').text(`Halo, ${loggedInUser}`); // Tampilkan informasi user
                $('#user-modal').show(); // Tampilkan modal user
            } else {
                alert('Anda belum login.');
            }
        }
    });

    // Tutup modal user
    $('.close-user').click(function() {
        $('#user-modal').hide();
    });

    // Awal: pastikan ikon selalu tampil dengan angka 0
    updateCartIcon();

    // sticky navbar on scroll
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }
        
        // scroll-up button show/hide
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // slide-up button
    $('.scroll-up-btn').click(function(){
        $('html, body').animate({scrollTop: 0}, 800);
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(e){
        e.preventDefault(); // prevent the default link behavior
        var target = $(this).attr('href'); // get the target section ID
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800); // adjust the duration (in milliseconds) as needed
    });

    $('.home .home-content .belisekarang').click(function(e){
        e.preventDefault(); // prevent the default link behavior
        var target = $(this).find('a').attr('href'); // get the target section ID
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800); // adjust the duration (in milliseconds) as needed
    });

    // typing text animation
    var typed = new Typed(".typing", {
        strings: ["Paket Data", "Server", "VPN", "..."],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    // Buka modal pembelian atau login saat tombol 'Beli Sekarang' diklik
    $('.buy-btn').click(function(){
        if (!checkLoginStatus()) {
            // Jika belum login, tampilkan modal login
            $('#login-modal').show();
        } else {
            // Jika sudah login, tampilkan modal pembelian
            $('#purchase-modal').show();
        }
    });

    // Tutup modal saat tombol 'x' diklik
    $('.close-btn').click(function(){
        $('#purchase-modal').hide();
        $('#login-modal').hide();
    });

    // Proses form pembelian
    $('#purchase-form').submit(function(e){
        e.preventDefault(); // Mencegah pengiriman form secara default

        // Ambil data dari form
        var formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            address: $('#address').val(),
            product: $('.buy-btn').data('product') // Ambil data produk dari tombol
        };

        // Kirim data ke server menggunakan AJAX
        $.ajax({
            type: 'POST',
            url: '/process-purchase', // Endpoint server untuk memproses pembelian
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Pembelian berhasil diproses!');
                $('#purchase-modal').hide();
            },
            error: function(error) {
                alert('Terjadi kesalahan, silakan coba lagi.');
            }
        });
    });

    // Event listener untuk memilih metode pembayaran
    $('.payment-method').click(function() {
        $('.payment-method').removeClass('selected');
        $(this).addClass('selected');
        $(this).find('input[type="radio"]').prop('checked', true);
    });

    // Menutup modal login
    $('.close-login').click(function(){
        $('#login-modal').hide();
    });
});
