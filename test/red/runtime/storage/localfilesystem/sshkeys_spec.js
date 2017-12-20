/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var should = require("should");
var fs = require('fs-extra');
var path = require('path');

var localfilesystem = require("../../../../../red/runtime/storage/localfilesystem");
var sshkeys = require("../../../../../red/runtime/storage/localfilesystem/sshkeys");

describe("storage/localfilesystem/sshkeys", function() {
    var userDir = path.join(__dirname,".testSSHKeyUserHome");
    var mockSettings = {
        userDir: userDir
    };
    var mockRuntime = {
        log:{
            _:function() { return "placeholder message"},
            info: function() { },
            trace: function() { }
        }
    };
    beforeEach(function(done) {
        fs.remove(userDir,function(err) {
            fs.mkdir(userDir,done);
        });
    });
    afterEach(function(done) {
        fs.remove(userDir,done);
    });
    
    it('should create sshkey directory when sshkey initializes', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                var ret = fs.existsSync(sshkeyDirPath);
                fs.existsSync(sshkeyDirPath).should.be.true();
                done();
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should get sshkey empty list if there is no sshkey file', function(done) {
        var username = 'test';
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    console.log('retObj:', retObj);
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(0);
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should get sshkey list', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var filenameList = ['test-key01', 'test-key02'];
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                for(var filename of filenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),"","utf8");        
                }
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(filenameList.length);
                    for(var filename of filenameList) {
                        retObj.should.containEql({ name: filename });
                    }
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should not get sshkey file if there is only private key', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var filenameList = ['test-key01', 'test-key02'];
        var onlyPrivateKeyFilenameList = ['test-key03', 'test-key04'];
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                for(var filename of filenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),"","utf8");        
                }
                for(var filename of onlyPrivateKeyFilenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                }
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(filenameList.length);
                    for(var filename of filenameList) {
                        retObj.should.containEql({ name: filename });
                    }
                    for(var filename of onlyPrivateKeyFilenameList) {
                        retObj.should.not.containEql({ name: filename });
                    }
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should not get sshkey file if there is only public key', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var filenameList = ['test-key01', 'test-key02'];
        var directoryList = ['test-key03', '.test-key04'];
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                for(var filename of filenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),"","utf8");        
                }
                for(var filename of directoryList) {
                    fs.ensureDirSync(path.join(sshkeyDirPath,filename));        
                }
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(filenameList.length);
                    for(var filename of filenameList) {
                        retObj.should.containEql({ name: filename });
                    }
                    for(var directoryname of directoryList) {
                        retObj.should.not.containEql({ name: directoryname });
                    }
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should get sshkey list that does not have directory', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var otherUsername = 'other';
        var filenameList = ['test-key01', 'test-key02'];
        var otherUserFilenameList = ['test-key03', 'test-key04'];
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                for(var filename of filenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),"","utf8");        
                }
                for(var filename of otherUserFilenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,otherUsername+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,otherUsername+"_"+filename+".pub"),"","utf8");        
                }
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(filenameList.length);
                    for(var filename of filenameList) {
                        retObj.should.containEql({ name: filename });
                    }
                    for(var filename of otherUserFilenameList) {
                        retObj.should.not.containEql({ name: filename });
                    }
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should get sshkey list that have keys of specified user', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var otherUsername = 'other';
        var filenameList = ['test-key01', 'test-key02'];
        var otherUserFilenameList = ['test-key03', 'test-key04'];
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                for(var filename of filenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),"","utf8");        
                }
                for(var filename of otherUserFilenameList) {
                    fs.writeFileSync(path.join(sshkeyDirPath,otherUsername+"_"+filename),"","utf8");        
                    fs.writeFileSync(path.join(sshkeyDirPath,otherUsername+"_"+filename+".pub"),"","utf8");        
                }
                sshkeys.listSSHKeys(username).then(function(retObj) {
                    retObj.should.be.instanceOf(Array).and.have.lengthOf(filenameList.length);
                    for(var filename of filenameList) {
                        retObj.should.containEql({ name: filename });
                    }
                    for(var filename of otherUserFilenameList) {
                        retObj.should.not.containEql({ name: filename });
                    }
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should generate sshkey file with empty data', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var options = {
            email: 'test@test.com',
            name: 'test-key01'
        };
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.generateSSHKey(username, options).then(function(retObj) {
                    retObj.should.be.equal(options.name);
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name)).should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name+'.pub')).should.be.true();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should generate sshkey file with password data', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var options = {
            email: 'test@test.com',
            name: 'test-key01',
            password: 'testtest'
        };
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.generateSSHKey(username, options).then(function(retObj) {
                    retObj.should.be.equal(options.name);
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name)).should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name+'.pub')).should.be.true();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should generate sshkey file with size data', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var options = {
            email: 'test@test.com',
            name: 'test-key01',
            size: 4096
        };
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.generateSSHKey(username, options).then(function(retObj) {
                    retObj.should.be.equal(options.name);
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name)).should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name+'.pub')).should.be.true();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should generate sshkey file with password & size data', function(done) {
        this.timeout(5000);
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var options = {
            email: 'test@test.com',
            name: 'test-key01',
            password: 'testtest',
            size: 4096
        };
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.generateSSHKey(username, options).then(function(retObj) {
                    retObj.should.be.equal(options.name);
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name)).should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name+'.pub')).should.be.true();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should not generate sshkey file with illegal size data', function(done) {
        this.timeout(5000);
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var options = {
            email: 'test@test.com',
            name: 'test-key01',
            size: 3333
        };
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                sshkeys.generateSSHKey(username, options).then(function(retObj) {
                    retObj.should.be.equal(options.name);
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name)).should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+options.name+'.pub')).should.be.true();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should get sshkey file content', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var filename = 'test-key01';
        var fileContent = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD3a+sgtgzSbbliWxmOq5p6+H/mE+0gjWfLWrkIVmHENd1mifV4uCmIHAR2NfuadUYMQ3+bQ90kpmmEKTMYPsyentsKpHQZxTzG7wOCAIpJnbPTHDMxEJhVTaAwEjbVyMSIzTTPfnhoavWIBu0+uMgKDDlBm+RjlgkFlyhXyCN6UwFrIUUMH6Gw+eQHLiooKIl8ce7uDxIlt+9b7hFCU+sQ3kvuse239DZluu6+8buMWqJvrEHgzS9adRFKku8nSPAEPYn85vDi7OgVAcLQufknNgs47KHBAx9h04LeSrFJ/P5J1b//ItRpMOIme+O9d1BR46puzhvUaCHLdvO9czj+OmW+dIm+QIk6lZIOOMnppG72kZxtLfeKT16ur+2FbwAdL9ItBp4BI/YTlBPoa5mLMxpuWfmX1qHntvtGc9wEwS1P7YFfmF3XiK5apxalzrn0Qlr5UmDNbVIqJb1OlbC0w03Z0oktti1xT+R2DGOLWM4lBbpXDHV1BhQ7oYOvbUD8Cnof55lTP0WHHsOHlQc/BGDti1XA9aBX/OzVyzBUYEf0pkimsD0RYo6aqt7QwehJYdlz9x1NBguBffT0s4NhNb9IWr+ASnFPvNl2sw4XH/8U0J0q8ZkMpKkbLM1Zdp1Fv00GF0f5UNRokai6uM3w/ccantJ3WvZ6GtctqytWrw== \n";
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),fileContent,"utf8");        
                sshkeys.getSSHKey(username, filename).then(function(retObj) {
                    retObj.should.be.equal(fileContent);
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });

    it('should delete sshkey files', function(done) {
        var sshkeyDirPath = path.join(userDir, 'projects', '.sshkeys');
        var username = 'test';
        var filename = 'test-key01';
        var fileContent = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD3a+sgtgzSbbliWxmOq5p6+H/mE+0gjWfLWrkIVmHENd1mifV4uCmIHAR2NfuadUYMQ3+bQ90kpmmEKTMYPsyentsKpHQZxTzG7wOCAIpJnbPTHDMxEJhVTaAwEjbVyMSIzTTPfnhoavWIBu0+uMgKDDlBm+RjlgkFlyhXyCN6UwFrIUUMH6Gw+eQHLiooKIl8ce7uDxIlt+9b7hFCU+sQ3kvuse239DZluu6+8buMWqJvrEHgzS9adRFKku8nSPAEPYn85vDi7OgVAcLQufknNgs47KHBAx9h04LeSrFJ/P5J1b//ItRpMOIme+O9d1BR46puzhvUaCHLdvO9czj+OmW+dIm+QIk6lZIOOMnppG72kZxtLfeKT16ur+2FbwAdL9ItBp4BI/YTlBPoa5mLMxpuWfmX1qHntvtGc9wEwS1P7YFfmF3XiK5apxalzrn0Qlr5UmDNbVIqJb1OlbC0w03Z0oktti1xT+R2DGOLWM4lBbpXDHV1BhQ7oYOvbUD8Cnof55lTP0WHHsOHlQc/BGDti1XA9aBX/OzVyzBUYEf0pkimsD0RYo6aqt7QwehJYdlz9x1NBguBffT0s4NhNb9IWr+ASnFPvNl2sw4XH/8U0J0q8ZkMpKkbLM1Zdp1Fv00GF0f5UNRokai6uM3w/ccantJ3WvZ6GtctqytWrw== \n";
        localfilesystem.init(mockSettings, mockRuntime).then(function() {
            sshkeys.init(mockSettings, mockRuntime).then(function() {
                fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename),"","utf8");        
                fs.writeFileSync(path.join(sshkeyDirPath,username+"_"+filename+".pub"),fileContent,"utf8");        
                sshkeys.deleteSSHKey(username, filename).then(function(retObj) {
                    retObj.should.be.true();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+filename)).should.be.false();
                    fs.existsSync(path.join(sshkeyDirPath,username+'_'+filename+'.pub')).should.be.false();
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });
});